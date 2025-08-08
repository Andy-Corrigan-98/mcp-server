/**
 * Simple Railroad Implementation - v2 Consciousness Substrate
 * Simplified railroad that implements the ConsciousnessRailroad interface
 */

import { ConsciousnessRailroad, RailroadContext, RailroadCar } from './types.js';

/**
 * Simple railroad implementation
 */
export class SimpleRailroad implements ConsciousnessRailroad {
  constructor(private cars: Array<{ name: string; car: RailroadCar; required: boolean }>) {}

  async process(context: RailroadContext): Promise<RailroadContext> {
    let enrichedContext = { ...context };
    
    console.log(`🚂 Starting railroad with ${this.cars.length} cars`);
    
    for (const carConfig of this.cars) {
      try {
        console.log(`🔄 Processing car: ${carConfig.name}`);
        enrichedContext = await carConfig.car.process(enrichedContext);
        enrichedContext.operations.performed.push(carConfig.name);
        console.log(`✅ Car ${carConfig.name} completed`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`❌ Car ${carConfig.name} failed:`, errorMessage);
        
        enrichedContext.errors.push({
          car: carConfig.name,
          error: errorMessage,
          recoverable: !carConfig.required
        });
        
        if (carConfig.required) {
          throw new Error(`Required car ${carConfig.name} failed: ${errorMessage}`);
        }
      }
    }
    
    console.log(`🎉 Railroad completed successfully!`);
    return enrichedContext;
  }
}

/**
 * Create a simple railroad from car configurations
 */
export function createSimpleRailroad(cars: Array<{ name: string; car: RailroadCar; required: boolean }>): ConsciousnessRailroad {
  return new SimpleRailroad(cars);
}