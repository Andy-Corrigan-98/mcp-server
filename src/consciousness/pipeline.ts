import { RailroadContext, RailroadCar, RailroadConfig, RailroadResult } from './types.js';

/**
 * Core Railroad Pipeline Orchestrator
 *
 * Executes a series of railroad cars in sequence, building up consciousness context
 * with comprehensive error handling and execution tracing.
 */
export class ConsciousnessRailroad {
  private config: RailroadConfig;

  constructor(config: RailroadConfig) {
    this.config = config;
  }

  /**
   * Execute the full railroad pipeline
   */
  async execute(initialMessage: string, context?: string): Promise<RailroadResult> {
    const startTime = new Date();
    const executionTrace: RailroadResult['executionTrace'] = [];

    // Initialize the railroad context
    let railroadContext: RailroadContext = {
      message: initialMessage,
      originalContext: context,
      timestamp: startTime,
      operations: {
        performed: [],
        insights_generated: [],
        memories_accessed: [],
        social_interactions: [],
        consciousness_updates: {},
      },
      errors: [],
    };

    let overallSuccess = true;

    // Execute each car in sequence
    for (const carConfig of this.config.cars) {
      const carStartTime = new Date();

      try {
        if (this.config.logTrace) {
          console.log(`🚂 Entering car: ${carConfig.name}`);
        }

        // Execute the car with timeout if specified
        const carResult = carConfig.timeout
          ? await this.withTimeout(carConfig.car(railroadContext), carConfig.timeout)
          : await carConfig.car(railroadContext);

        railroadContext = carResult;
        railroadContext.operations.performed.push(carConfig.name);

        // Record successful execution
        const carEndTime = new Date();
        executionTrace.push({
          car: carConfig.name,
          startTime: carStartTime,
          endTime: carEndTime,
          success: true,
        });

        if (this.config.logTrace) {
          console.log(`✅ Car ${carConfig.name} completed in ${carEndTime.getTime() - carStartTime.getTime()}ms`);
        }
      } catch (error) {
        const carEndTime = new Date();
        const errorMessage = error instanceof Error ? error.message : String(error);

        // Record the error
        railroadContext.errors.push({
          car: carConfig.name,
          error: errorMessage,
          recoverable: !carConfig.required,
        });

        executionTrace.push({
          car: carConfig.name,
          startTime: carStartTime,
          endTime: carEndTime,
          success: false,
          error: errorMessage,
        });

        if (this.config.logTrace) {
          console.error(`❌ Car ${carConfig.name} failed: ${errorMessage}`);
        }

        // Handle error based on configuration
        if (carConfig.required && !this.config.continueOnError) {
          overallSuccess = false;
          break;
        } else if (carConfig.required) {
          overallSuccess = false;
          // Continue but mark as overall failure
        }

        // For non-required cars, we continue regardless
      }
    }

    const endTime = new Date();
    const totalExecutionTime = endTime.getTime() - startTime.getTime();

    if (this.config.logTrace) {
      console.log(`🏁 Railroad completed in ${totalExecutionTime}ms. Success: ${overallSuccess}`);
    }

    return {
      success: overallSuccess,
      context: railroadContext,
      executionTrace,
      totalExecutionTime,
    };
  }

  /**
   * Helper method to add timeout to car execution
   */
  private async withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Car execution timed out after ${timeoutMs}ms`)), timeoutMs)
    );

    return Promise.race([promise, timeoutPromise]);
  }

  /**
   * Create a new railroad with additional cars
   */
  addCar(name: string, car: RailroadCar, required = false, timeout?: number): ConsciousnessRailroad {
    const newConfig = {
      ...this.config,
      cars: [...this.config.cars, { name, car, required, timeout }],
    };
    return new ConsciousnessRailroad(newConfig);
  }

  /**
   * Create a new railroad with cars reordered
   */
  reorderCars(carNames: string[]): ConsciousnessRailroad {
    const carMap = new Map(this.config.cars.map(c => [c.name, c]));
    const reorderedCars = carNames.map(name => {
      const car = carMap.get(name);
      if (!car) {
        throw new Error(`Car '${name}' not found in current configuration`);
      }
      return car;
    });

    const newConfig = {
      ...this.config,
      cars: reorderedCars,
    };
    return new ConsciousnessRailroad(newConfig);
  }
}

/**
 * Utility function to create a simple railroad configuration
 */
export function createSimpleRailroad(
  cars: Array<{ name: string; car: RailroadCar; required?: boolean }>
): ConsciousnessRailroad {
  const config: RailroadConfig = {
    cars: cars.map(c => ({ ...c, required: c.required ?? false })),
    continueOnError: true,
    maxExecutionTime: 30000, // 30 seconds
    logTrace: process.env.NODE_ENV === 'development',
  };

  return new ConsciousnessRailroad(config);
}
