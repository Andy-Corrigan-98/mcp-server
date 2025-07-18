import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { FunctionalConsciousnessTools } from '../features/consciousness/index.js';
import { TimeTools } from './time/time-tools.js';
import { FunctionalMemoryTools } from '../features/memory/index.js';
import { FunctionalReasoningTools } from '../features/reasoning/index.js';
import { GenAIReasoningToolsWrapper } from './reasoning/genai-reasoning-wrapper.js';
import { ConversationalGenAIToolsWrapper } from './reasoning/conversational-genai-wrapper.js';
import { ConfigurationTools } from './configuration/configuration-tools.js';
import { DaydreamingTools } from './daydreaming/daydreaming-tools.js';
import { initializeBackgroundScheduler } from './daydreaming/background-scheduler.js';
import { FunctionalSocialTools } from '../features/social/index.js';

/**
 * Central registry for all consciousness tools
 * Manages tool registration and provides unified access
 */
export class ConsciousnessToolsRegistry {
  private tools: Map<string, Tool> = new Map();
  private toolExecutors: Map<string, (toolName: string, args: Record<string, unknown>) => Promise<unknown>> = new Map();
  private daydreamingScheduler: any = null;

  constructor() {
    this.registerTools();
  }

  /**
   * Register all available tool categories
   */
  private registerTools(): void {
    // Register consciousness tools (now using functional approach)
    const consciousnessTools = new FunctionalConsciousnessTools();
    this.registerToolCategory(consciousnessTools);

    // Register time tools
    const timeTools = new TimeTools();
    this.registerToolCategory(timeTools);

    // Register memory tools (now using functional approach)
    const memoryTools = new FunctionalMemoryTools();
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
      const reasoningTools = new FunctionalReasoningTools();
      this.registerToolCategory(reasoningTools);
    }

    // Register configuration tools
    const configurationTools = new ConfigurationTools();
    this.registerToolCategory(configurationTools);

    // Register functional social tools (single-responsibility architecture)
    console.log('🔧 Using functional social tools with single-responsibility modules');
    this.registerFunctionalTools('social_', FunctionalSocialTools);

    // Register day-dreaming loop tools
    const daydreamingTools = new DaydreamingTools();
    this.registerToolCategory(daydreamingTools);

    // Store reference for background scheduler
    this.daydreamingScheduler = initializeBackgroundScheduler(daydreamingTools);

    // Start the background scheduler
    this.initializeBackgroundScheduler();
  }

  /**
   * Register a tool category (class-based approach)
   */
  private registerToolCategory(toolCategory: {
    getTools(): Record<string, Tool>;
    execute(toolName: string, args: Record<string, unknown>): Promise<unknown>;
  }): void {
    const tools = toolCategory.getTools();

    Object.entries(tools).forEach(([name, tool]) => {
      this.tools.set(name, tool);
      this.toolExecutors.set(name, (toolName, args) => toolCategory.execute(toolName, args));
    });
  }

  /**
   * Register functional tools (new approach)
   */
  private registerFunctionalTools(
    prefix: string,
    functionalTools: {
      getTools(): Record<string, Tool>;
      execute(toolName: string, args: Record<string, unknown>): Promise<unknown>;
    }
  ): void {
    const tools = functionalTools.getTools();

    Object.entries(tools).forEach(([name, tool]) => {
      if (name.startsWith(prefix) || prefix === '') {
        this.tools.set(name, tool);
        this.toolExecutors.set(name, (toolName, args) => functionalTools.execute(toolName, args));
      }
    });
  }

  /**
   * Get all registered tools
   */
  getTools(): Record<string, Tool> {
    const result: Record<string, Tool> = {};
    this.tools.forEach((tool, name) => {
      result[name] = tool;
    });
    return result;
  }

  /**
   * Execute a tool by name
   */
  async executeTool(toolName: string, args: Record<string, unknown>): Promise<unknown> {
    const executor = this.toolExecutors.get(toolName);
    if (!executor) {
      throw new Error(`Tool '${toolName}' not found`);
    }

    return executor(toolName, args);
  }

  /**
   * Initialize the background daydreaming scheduler
   */
  private async initializeBackgroundScheduler(): Promise<void> {
    if (this.daydreamingScheduler) {
      await this.daydreamingScheduler.start();
    }
  }

  /**
   * Cleanup method to stop background processes
   */
  async cleanup(): Promise<void> {
    if (this.daydreamingScheduler) {
      await this.daydreamingScheduler.stop();
    }
  }
}
