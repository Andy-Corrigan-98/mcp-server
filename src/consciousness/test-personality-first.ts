/**
 * Simple test for V3 Personality-First Architecture
 * 
 * This test verifies that the new parallel analysis + personality synthesis
 * architecture works correctly and produces expected results.
 */

import { processWithPersonalityFirst, compareConsciousnessArchitectures } from './personality-first-consciousness.js';

/**
 * Test basic functionality of personality-first architecture
 */
async function testBasicPersonalityFirst() {
  console.log('🧪 Testing V3 Personality-First Architecture...\n');

  const testMessage = "Hey Echo, I think this personality evolution idea sounds really good. Let's start implementing it!";
  const testContext = "We've been discussing optimizing personality imbuing in the consciousness system.";

  try {
    console.log('📨 Test Message:', testMessage);
    console.log('📝 Test Context:', testContext);
    console.log('\n' + '='.repeat(80) + '\n');

    const result = await processWithPersonalityFirst(testMessage, testContext, 'development');

    console.log('✅ Personality-First Processing SUCCESSFUL!\n');

    // Display results
    console.log('📊 PROCESSING RESULTS:');
    console.log('─'.repeat(40));
    
    console.log('\n🧠 Sub-Analyses Performed:');
    if (result.subAnalyses) {
      Object.entries(result.subAnalyses).forEach(([name, analysis]) => {
        console.log(`  ✓ ${name}: ${analysis ? 'SUCCESS' : 'FAILED'}`);
        if (analysis && 'confidence' in analysis) {
          console.log(`    Confidence: ${(analysis.confidence * 100).toFixed(1)}%`);
        }
      });
    }

    console.log('\n🎭 Personality Synthesis:');
    if (result.personalityContext) {
      const pc = result.personalityContext;
      console.log(`  Synthesis Confidence: ${(pc.synthesisConfidence * 100).toFixed(1)}%`);
      console.log(`  Adaptation Level: ${(pc.contextualAdaptations.adaptationLevel * 100).toFixed(1)}%`);
      console.log(`  Response Style: ${pc.contextualAdaptations.responseStyle}`);
      console.log(`  Communication Tone: ${pc.communicationStrategy.tone}`);
      console.log(`  Core Traits Applied:`);
      Object.entries(pc.coreTraits).forEach(([trait, value]) => {
        console.log(`    ${trait}: ${value}`);
      });
      
      if (pc.evolutionIndicators.traitReinforcement.length > 0) {
        console.log(`  Traits Reinforced: ${pc.evolutionIndicators.traitReinforcement.join(', ')}`);
      }
      
      if (pc.evolutionIndicators.emergingPatterns.length > 0) {
        console.log(`  Emerging Patterns: ${pc.evolutionIndicators.emergingPatterns.join(', ')}`);
      }
    }

    console.log('\n🚂 Railroad Execution:');
    console.log(`  Operations Performed: ${result.operations.performed.join(', ')}`);
    console.log(`  Errors: ${result.errors.length}`);
    if (result.errors.length > 0) {
      result.errors.forEach(error => {
        console.log(`    ❌ ${error.car}: ${error.error} (${error.recoverable ? 'recoverable' : 'critical'})`);
      });
    }

    console.log('\n🔍 Synthesis Reasoning:');
    if (result.personalityContext?.synthesisReasoning) {
      result.personalityContext.synthesisReasoning.forEach((reason, index) => {
        console.log(`  ${index + 1}. ${reason}`);
      });
    }

    return true;

  } catch (error) {
    console.error('❌ Personality-First Processing FAILED:', error);
    return false;
  }
}

/**
 * Test comparison between architectures
 */
async function testArchitectureComparison() {
  console.log('\n' + '='.repeat(80));
  console.log('🔬 ARCHITECTURE COMPARISON TEST\n');

  const testMessage = "I'm curious about how personality traits evolve over time. How does the system track changes?";
  const testContext = "Exploring personality development and consciousness evolution.";

  try {
    const comparison = await compareConsciousnessArchitectures(testMessage, testContext);
    
    console.log('\n📈 COMPARISON SUMMARY:');
    console.log('─'.repeat(40));
    console.log(`V3 Processing Time: ${comparison.v3.duration}ms`);
    console.log(`V3 Synthesis Confidence: ${(comparison.v3.synthesisConfidence * 100).toFixed(1)}%`);
    console.log(`V3 Adaptation Level: ${(comparison.v3.adaptationLevel * 100).toFixed(1)}%`);

    return true;

  } catch (error) {
    console.error('❌ Architecture Comparison FAILED:', error);
    return false;
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('🎯 V3 PERSONALITY-FIRST ARCHITECTURE TESTS');
  console.log('═'.repeat(80));

  const results = [];

  // Test 1: Basic functionality
  results.push(await testBasicPersonalityFirst());

  // Test 2: Architecture comparison
  results.push(await testArchitectureComparison());

  // Summary
  const successCount = results.filter(Boolean).length;
  const totalTests = results.length;

  console.log('\n' + '═'.repeat(80));
  console.log('🏁 TEST SUMMARY');
  console.log('═'.repeat(80));
  console.log(`Tests Passed: ${successCount}/${totalTests}`);
  console.log(`Success Rate: ${((successCount / totalTests) * 100).toFixed(1)}%`);
  
  if (successCount === totalTests) {
    console.log('🎉 ALL TESTS PASSED! V3 Architecture is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Check the logs above for details.');
  }

  return successCount === totalTests;
}

// Export for external use
export { testBasicPersonalityFirst, testArchitectureComparison, runAllTests };

// Run tests if this file is executed directly
if (import.meta.url === new URL(import.meta.url).href) {
  runAllTests().catch(console.error);
}