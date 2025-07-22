import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { DAYDREAMING_TOOLS } from '../../tools/daydreaming/types.js';

// Import functional modules
import { configureDaydreaming } from './config/configure.js';
import { sampleConcepts } from './sampling/sample-concepts.js';
import { exploreConnection } from './exploration/explore-connection.js';
import { evaluateInsight } from './evaluation/evaluate-insight.js';
import { daydreamCycle } from './cycles/execute-cycle.js';
import { getDaydreamInsights } from './storage/get-insights.js';

/**
 * Functional Daydreaming Tools
 * Routes tool calls to appropriate functional modules using single-responsibility pattern
 */
export class FunctionalDaydreamingTools {
  /**
   * Get available tool definitions
   */
  getTools(): Record<string, Tool> {
    return DAYDREAMING_TOOLS;
  }

  /**
   * Execute a daydreaming tool operation
   */
  async execute(toolName: string, args: Record<string, unknown>): Promise<unknown> {
    switch (toolName) {
      case 'daydream_cycle':
        return daydreamCycle(args);

      case 'sample_concepts':
        return sampleConcepts(args);

      case 'explore_connection':
        return exploreConnection(args);

      case 'evaluate_insight':
        return evaluateInsight(args);

      case 'get_daydream_insights':
        return getDaydreamInsights(args);

      case 'configure_daydreaming':
        return configureDaydreaming(args);

      default:
        throw new Error(`Unknown daydreaming tool: ${toolName}`);
    }
  }
}

/**
 * Execute a daydreaming operation using the functional architecture
 */
export async function executeDaydreamingOperation(operation: string, args: Record<string, unknown>): Promise<unknown> {
  const tools = new FunctionalDaydreamingTools();
  return tools.execute(operation, args);
}

// Export all functional modules for external use
export * from './config/index.js';
export * from './sampling/index.js';
export * from './exploration/index.js';
export * from './evaluation/index.js';
export * from './cycles/index.js';
export * from './storage/index.js';
export * from './sources/index.js';
