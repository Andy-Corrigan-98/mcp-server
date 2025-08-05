/**
 * V3 Personality-First Consciousness Factory
 * 
 * Factory functions to create and configure the new personality-first consciousness
 * railroad that processes context in parallel then synthesizes through personality.
 */

import { 
  PersonalityFirstRailroad, 
  PersonalityFirstConfig 
} from './types-v3.js';
import { createPersonalityFirstRailroad } from './personality-first-railroad.js';
import { messageSubAnalysisCar } from './message-sub-analysis-car.js';
import { sessionSubAnalysisCar } from './session-sub-analysis-car.js';
import { memorySubAnalysisCar } from './memory-sub-analysis-car.js';
import { socialSubAnalysisCar } from './social-sub-analysis-car.js';
import { personalitySynthesisCar } from './personality-synthesis-car.js';

/**
 * Create the default personality-first consciousness railroad
 */
export function createPersonalityFirstConsciousness(): PersonalityFirstRailroad {
  const config: PersonalityFirstConfig = {
    subAnalysisCars: [
      {
        name: 'message-analysis',
        car: messageSubAnalysisCar,
        required: true, // Message analysis is critical
        timeout: 10000 // 10 second timeout
      },
      {
        name: 'session-analysis',
        car: sessionSubAnalysisCar,
        required: true, // Session context is fundamental
        timeout: 5000 // 5 second timeout
      },
      {
        name: 'memory-analysis',
        car: memorySubAnalysisCar,
        required: false, // Memory can fail gracefully
        timeout: 8000 // 8 second timeout
      },
      {
        name: 'social-analysis',
        car: socialSubAnalysisCar,
        required: false, // Social context is optional
        timeout: 6000 // 6 second timeout
      }
    ],
    personalitySynthesisCar: personalitySynthesisCar,
    logTrace: true, // Enable detailed logging for development
    continueOnError: true // Continue processing even if non-required cars fail
  };

  return createPersonalityFirstRailroad(config);
}

/**
 * Create a lightweight personality-first railroad for simple interactions
 */
export function createLightweightPersonalityConsciousness(): PersonalityFirstRailroad {
  const config: PersonalityFirstConfig = {
    subAnalysisCars: [
      {
        name: 'message-analysis',
        car: messageSubAnalysisCar,
        required: true,
        timeout: 5000 // Shorter timeout for lightweight mode
      },
      {
        name: 'session-analysis',
        car: sessionSubAnalysisCar,
        required: true,
        timeout: 3000
      }
      // Memory and social analysis omitted for lightweight mode
    ],
    personalitySynthesisCar: personalitySynthesisCar,
    logTrace: false, // Disable logging for lightweight mode
    continueOnError: true
  };

  return createPersonalityFirstRailroad(config);
}

/**
 * Create a development personality-first railroad with extensive logging and error handling
 */
export function createDevelopmentPersonalityConsciousness(): PersonalityFirstRailroad {
  const config: PersonalityFirstConfig = {
    subAnalysisCars: [
      {
        name: 'message-analysis',
        car: messageSubAnalysisCar,
        required: true,
        timeout: 15000 // Longer timeout for development
      },
      {
        name: 'session-analysis',
        car: sessionSubAnalysisCar,
        required: true,
        timeout: 10000
      },
      {
        name: 'memory-analysis',
        car: memorySubAnalysisCar,
        required: false,
        timeout: 12000
      },
      {
        name: 'social-analysis',
        car: socialSubAnalysisCar,
        required: false,
        timeout: 10000
      }
    ],
    personalitySynthesisCar: personalitySynthesisCar,
    logTrace: true, // Extensive logging for development
    continueOnError: false // Fail fast for development debugging
  };

  return createPersonalityFirstRailroad(config);
}

/**
 * Create a production personality-first railroad optimized for performance
 */
export function createProductionPersonalityConsciousness(): PersonalityFirstRailroad {
  const config: PersonalityFirstConfig = {
    subAnalysisCars: [
      {
        name: 'message-analysis',
        car: messageSubAnalysisCar,
        required: true,
        timeout: 7000 // Optimized timeout for production
      },
      {
        name: 'session-analysis',
        car: sessionSubAnalysisCar,
        required: true,
        timeout: 4000
      },
      {
        name: 'memory-analysis',
        car: memorySubAnalysisCar,
        required: false,
        timeout: 6000
      },
      {
        name: 'social-analysis',
        car: socialSubAnalysisCar,
        required: false,
        timeout: 5000
      }
    ],
    personalitySynthesisCar: personalitySynthesisCar,
    logTrace: false, // Minimal logging for production
    continueOnError: true // Graceful degradation in production
  };

  return createPersonalityFirstRailroad(config);
}

/**
 * Process a message using the personality-first consciousness system
 */
export async function processWithPersonalityFirst(
  message: string,
  context?: string,
  mode: 'default' | 'lightweight' | 'development' | 'production' = 'default'
) {
  // Select appropriate railroad configuration
  let railroad: PersonalityFirstRailroad;
  
  switch (mode) {
    case 'lightweight':
      railroad = createLightweightPersonalityConsciousness();
      break;
    case 'development':
      railroad = createDevelopmentPersonalityConsciousness();
      break;
    case 'production':
      railroad = createProductionPersonalityConsciousness();
      break;
    default:
      railroad = createPersonalityFirstConsciousness();
  }

  // Process the message through personality-first railroad
  const result = await railroad.process({
    message,
    originalContext: context,
    timestamp: new Date().toISOString(),
    sessionId: `personality-first-${Date.now()}`,
    userId: 'system'
  });

  return result;
}

/**
 * Utility function to compare V2 vs V3 consciousness processing
 */
export async function compareConsciousnessArchitectures(
  message: string,
  context?: string
) {
  console.log('🔬 Comparing V2 vs V3 Consciousness Architectures...');
  
  // Process with V3 (personality-first)
  const v3StartTime = Date.now();
  const v3Result = await processWithPersonalityFirst(message, context, 'development');
  const v3Duration = Date.now() - v3StartTime;
  
  console.log(`📊 Architecture Comparison Results:`);
  console.log(`   V3 (Personality-First): ${v3Duration}ms`);
  console.log(`   V3 Synthesis Confidence: ${v3Result.personalityContext?.synthesisConfidence.toFixed(3)}`);
  console.log(`   V3 Adaptation Level: ${v3Result.personalityContext?.contextualAdaptations.adaptationLevel.toFixed(3)}`);
  console.log(`   V3 Sub-Analyses: ${Object.keys(v3Result.subAnalyses || {}).length}`);
  
  return {
    v3: {
      result: v3Result,
      duration: v3Duration,
      synthesisConfidence: v3Result.personalityContext?.synthesisConfidence || 0,
      adaptationLevel: v3Result.personalityContext?.contextualAdaptations.adaptationLevel || 0
    }
  };
}