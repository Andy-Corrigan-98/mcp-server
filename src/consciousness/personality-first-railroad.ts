/**
 * V3 Personality-First Railroad - Parallel Analysis + Personality Synthesis
 * 
 * New architecture where all context cars run in parallel producing sub-analyses,
 * then personality car synthesizes everything into a comprehensive personality-aware context.
 */

import { 
  RailroadContext, 
  PersonalityFirstRailroad, 
  PersonalityFirstConfig,
  MessageSubAnalysis,
  SessionSubAnalysis,
  MemorySubAnalysis,
  SocialSubAnalysis
} from './types-v3.js';

/**
 * Personality-First Railroad Implementation
 */
export class PersonalityFirstRailroadImpl implements PersonalityFirstRailroad {
  constructor(private config: PersonalityFirstConfig) {}

  async process(initialContext: Pick<RailroadContext, 'message' | 'originalContext' | 'timestamp' | 'sessionId' | 'userId'>): Promise<RailroadContext> {
    const startTime = Date.now();
    
    // Initialize base railroad context
    let context: RailroadContext = {
      ...initialContext,
      operations: {
        performed: [],
        insights_generated: [],
        memories_accessed: [],
        social_interactions: [],
        consciousness_updates: {},
      },
      errors: [],
      subAnalyses: {}
    };

    if (this.config.logTrace) {
      console.log(`🧠 Starting Personality-First Railroad with ${this.config.subAnalysisCars.length} parallel cars`);
    }

    // PHASE 1: Parallel Sub-Analysis
    const subAnalysisResults = await this.executeParallelSubAnalysis(initialContext);
    
    // Add sub-analyses to context
    context.subAnalyses = subAnalysisResults.analyses;
    context.operations.performed.push(...subAnalysisResults.performed);
    context.errors.push(...subAnalysisResults.errors);

    // PHASE 2: Personality Synthesis
    if (this.config.logTrace) {
      console.log(`🎭 Personality Synthesis: Integrating ${Object.keys(subAnalysisResults.analyses).length} sub-analyses`);
    }

    try {
      const synthesisStartTime = Date.now();
      
      context = await this.config.personalitySynthesisCar.synthesize(context, subAnalysisResults.analyses);
      context.operations.performed.push('personality-synthesis');
      
      if (this.config.logTrace) {
        console.log(`✅ Personality Synthesis completed in ${Date.now() - synthesisStartTime}ms`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      context.errors.push({
        car: 'personality-synthesis',
        error: errorMessage,
        recoverable: false // Personality synthesis is critical
      });
      
      if (!this.config.continueOnError) {
        throw new Error(`Personality synthesis failed: ${errorMessage}`);
      }
    }

    if (this.config.logTrace) {
      console.log(`🎉 Personality-First Railroad completed in ${Date.now() - startTime}ms`);
    }

    return context;
  }

  /**
   * Execute all sub-analysis cars in parallel
   */
  private async executeParallelSubAnalysis(
    initialContext: Pick<RailroadContext, 'message' | 'originalContext' | 'timestamp' | 'sessionId' | 'userId'>
  ): Promise<{
    analyses: {
      messageAnalysis?: MessageSubAnalysis;
      sessionAnalysis?: SessionSubAnalysis;
      memoryAnalysis?: MemorySubAnalysis;
      socialAnalysis?: SocialSubAnalysis;
    };
    performed: string[];
    errors: Array<{ car: string; error: string; recoverable: boolean }>;
  }> {
    const analyses: any = {};
    const performed: string[] = [];
    const errors: Array<{ car: string; error: string; recoverable: boolean }> = [];

    // Create parallel promises for all sub-analysis cars
    const analysisPromises = this.config.subAnalysisCars.map(async (carConfig) => {
      const carStartTime = Date.now();
      
      try {
        if (this.config.logTrace) {
          console.log(`🔄 Starting sub-analysis: ${carConfig.name}`);
        }

        // Execute with optional timeout
        const analysis = carConfig.timeout
          ? await this.withTimeout(carConfig.car.analyzeAsync(initialContext), carConfig.timeout)
          : await carConfig.car.analyzeAsync(initialContext);

        if (this.config.logTrace) {
          console.log(`✅ Sub-analysis ${carConfig.name} completed in ${Date.now() - carStartTime}ms`);
        }

        return {
          name: carConfig.name,
          analysis,
          success: true
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        if (this.config.logTrace) {
          console.error(`❌ Sub-analysis ${carConfig.name} failed: ${errorMessage}`);
        }

        return {
          name: carConfig.name,
          error: errorMessage,
          required: carConfig.required,
          success: false
        };
      }
    });

    // Wait for all parallel analyses to complete
    const results = await Promise.all(analysisPromises);

    // Process results
    for (const result of results) {
      if (result.success) {
        // Map analysis results to correct sub-analysis type
        switch (result.name) {
          case 'message-analysis':
            analyses.messageAnalysis = result.analysis as MessageSubAnalysis;
            break;
          case 'session-analysis':
            analyses.sessionAnalysis = result.analysis as SessionSubAnalysis;
            break;
          case 'memory-analysis':
            analyses.memoryAnalysis = result.analysis as MemorySubAnalysis;
            break;
          case 'social-analysis':
            analyses.socialAnalysis = result.analysis as SocialSubAnalysis;
            break;
        }
        performed.push(result.name);
      } else {
        errors.push({
          car: result.name,
          error: result.error!,
          recoverable: !result.required
        });

        // If required car failed and we don't continue on error, throw
        if (result.required && !this.config.continueOnError) {
          throw new Error(`Required sub-analysis car ${result.name} failed: ${result.error}`);
        }
      }
    }

    return { analyses, performed, errors };
  }

  /**
   * Execute promise with timeout
   */
  private async withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs);
    });

    return Promise.race([promise, timeoutPromise]);
  }
}

/**
 * Factory function to create personality-first railroad
 */
export function createPersonalityFirstRailroad(config: PersonalityFirstConfig): PersonalityFirstRailroad {
  return new PersonalityFirstRailroadImpl(config);
}