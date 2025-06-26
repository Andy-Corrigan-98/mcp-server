import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { ConsciousnessTools } from './consciousness.js';
import { TimeTools } from './time.js';
import { MemoryTools } from './memory.js';

export interface ToolExecutor {
  execute(args: Record<string, unknown>): Promise<unknown>;
}

export class EchoToolsRegistry {
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
  }

  private registerToolCategory(toolCategory: any): void {
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
