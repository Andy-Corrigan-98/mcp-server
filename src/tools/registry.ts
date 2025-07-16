import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { ConsciousnessTools } from './consciousness/index.js';
import { TimeTools } from './time/index.js';
import { MemoryTools } from './memory/index.js';
import { ReasoningTools } from './reasoning/index.js';
import { GenAIReasoningToolsWrapper } from './reasoning/genai-reasoning-wrapper.js';
import { ConversationalGenAIToolsWrapper } from './reasoning/conversational-genai-wrapper.js';
import { ConfigurationTools } from './configuration/index.js';
import { SocialTools } from './social/index.js';
import {
  DaydreamingTools,
  DaydreamingBackgroundScheduler,
  initializeBackgroundScheduler,
  recordUserActivity,
} from './daydreaming/index.js';

export interface ToolExecutor {
  execute(args: Record<string, unknown>): Promise<unknown>;
}

export class ConsciousnessToolsRegistry {
  // Constants for initialization timing
  private static readonly SCHEDULER_INIT_DELAY_MS = 5000; // 5 seconds

  private tools: Map<string, { definition: Tool; executor: ToolExecutor }> = new Map();
  private daydreamingScheduler: DaydreamingBackgroundScheduler | null = null;

  constructor() {
    this.registerTools();
  }

  private registerTools(): void {
    // Register consciousness tools
    const consciousnessTools = new ConsciousnessTools();
    this.registerToolCategory(consciousnessTools);

    // Register time tools
    const timeTools = new TimeTools();
    this.registerToolCategory(timeTools);

    // Register memory tools
    const memoryTools = new MemoryTools();
    this.registerToolCategory(memoryTools);

    // Register reasoning tools (GenAI-powered if API key available)
    const useGenAI = !!process.env.GOOGLE_GENAI_API_KEY;
    if (useGenAI) {
      console.log('🧠 Using Google GenAI-powered reasoning tools');
      const genAIReasoningTools = new GenAIReasoningToolsWrapper();
      this.registerToolCategory(genAIReasoningTools);
      
      console.log('💬 Adding conversational GenAI tools for natural dialogue');
      const conversationalGenAITools = new ConversationalGenAIToolsWrapper();
      this.registerToolCategory(conversationalGenAITools);
    } else {
      console.log('🧠 Using traditional reasoning tools (set GOOGLE_GENAI_API_KEY for GenAI)');
      const reasoningTools = new ReasoningTools();
      this.registerToolCategory(reasoningTools);
    }

    // Register configuration tools
    const configurationTools = new ConfigurationTools();
    this.registerToolCategory(configurationTools);

    // Register social consciousness tools
    const socialTools = new SocialTools();
    this.registerToolCategory(socialTools);

    // Register day-dreaming loop tools
    const daydreamingTools = new DaydreamingTools();
    this.registerToolCategory(daydreamingTools);

    // Store reference for background scheduler
    this.daydreamingScheduler = initializeBackgroundScheduler(daydreamingTools);

    // Start the background scheduler
    this.initializeBackgroundScheduler();
  }

  /**
   * Initialize and start the background Day-Dreaming Loop scheduler
   */
  private async initializeBackgroundScheduler(): Promise<void> {
    // Start the scheduler after a brief delay to allow initialization
    setTimeout(async () => {
      if (this.daydreamingScheduler) {
        await this.daydreamingScheduler.start();
        console.log('🌙 Day-Dreaming Loop background scheduler initialized');
      }
    }, ConsciousnessToolsRegistry.SCHEDULER_INIT_DELAY_MS);
  }

  private registerToolCategory(toolCategory: {
    getTools(): Record<string, Tool>;
    execute(name: string, args: Record<string, unknown>): Promise<unknown>;
  }): void {
    const tools = toolCategory.getTools();

    for (const [name, definition] of Object.entries(tools)) {
      this.tools.set(name, {
        definition: definition as Tool,
        executor: {
          execute: (args: Record<string, unknown>) => toolCategory.execute(name, args),
        },
      });
    }
  }

  getAllTools(): Tool[] {
    return Array.from(this.tools.values()).map(tool => tool.definition);
  }

  async executeTool(name: string, args: Record<string, unknown>): Promise<unknown> {
    const tool = this.tools.get(name);

    if (!tool) {
      throw new Error(`Tool '${name}' not found`);
    }

    // Record user activity for the Day-Dreaming Loop scheduler
    recordUserActivity();

    return await tool.executor.execute(args);
  }
}
