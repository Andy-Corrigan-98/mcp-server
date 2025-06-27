import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { ConsciousnessTools } from './consciousness.js';
import { TimeTools } from './time.js';
import { MemoryTools } from './memory/index.js';
import { ReasoningTools } from './reasoning/index.js';

export interface ToolExecutor {
  execute(args: Record<string, unknown>): Promise<unknown>;
}

export class ConsciousnessToolsRegistry {
  private tools: Map<string, { definition: Tool; executor: ToolExecutor }> = new Map();

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

    // Register reasoning tools
    const reasoningTools = new ReasoningTools();
    this.registerToolCategory(reasoningTools);
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

    return await tool.executor.execute(args);
  }
}
