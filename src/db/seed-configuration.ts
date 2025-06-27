import { ConfigurationService } from './configuration-service.js';
import { ConfigurationType, ConfigurationCategory } from '@prisma/client';

interface ConfigurationSeed {
  key: string;
  value: string | number | boolean;
  type: ConfigurationType;
  category: ConfigurationCategory;
  description: string;
}

const CONFIGURATION_SEEDS: ConfigurationSeed[] = [
  // Consciousness Tools Configuration
  {
    key: 'consciousness.max_topic_length',
    value: 500,
    type: 'NUMBER',
    category: 'CONSCIOUSNESS',
    description: 'Maximum length for consciousness reflection topics',
  },
  {
    key: 'consciousness.max_context_length',
    value: 1000,
    type: 'NUMBER',
    category: 'CONSCIOUSNESS',
    description: 'Maximum length for consciousness reflection context',
  },
  {
    key: 'consciousness.max_snippet_length',
    value: 100,
    type: 'NUMBER',
    category: 'CONSCIOUSNESS',
    description: 'Maximum length for memory snippet display',
  },
  {
    key: 'consciousness.max_memory_slice',
    value: 5,
    type: 'NUMBER',
    category: 'CONSCIOUSNESS',
    description: 'Maximum number of recent memories to include',
  },
  {
    key: 'consciousness.max_intention_length',
    value: 500,
    type: 'NUMBER',
    category: 'CONSCIOUSNESS',
    description: 'Maximum length for intention descriptions',
  },
  {
    key: 'consciousness.max_insight_length',
    value: 1000,
    type: 'NUMBER',
    category: 'CONSCIOUSNESS',
    description: 'Maximum length for captured insights',
  },
  {
    key: 'consciousness.default_confidence',
    value: 0.8,
    type: 'NUMBER',
    category: 'CONSCIOUSNESS',
    description: 'Default confidence level for consciousness operations',
  },
  {
    key: 'consciousness.high_confidence_threshold',
    value: 0.8,
    type: 'NUMBER',
    category: 'CONSCIOUSNESS',
    description: 'Threshold for high confidence classification',
  },
  {
    key: 'consciousness.medium_confidence_threshold',
    value: 0.6,
    type: 'NUMBER',
    category: 'CONSCIOUSNESS',
    description: 'Threshold for medium confidence classification',
  },
  {
    key: 'consciousness.min_cognitive_load',
    value: 0.1,
    type: 'NUMBER',
    category: 'CONSCIOUSNESS',
    description: 'Minimum cognitive load level',
  },
  {
    key: 'consciousness.max_cognitive_load',
    value: 1.0,
    type: 'NUMBER',
    category: 'CONSCIOUSNESS',
    description: 'Maximum cognitive load level',
  },
  {
    key: 'consciousness.cognitive_load_decay_time',
    value: 30000,
    type: 'NUMBER',
    category: 'CONSCIOUSNESS',
    description: 'Time in milliseconds for cognitive load to decay',
  },
  {
    key: 'consciousness.cognitive_load_decay_amount',
    value: 0.05,
    type: 'NUMBER',
    category: 'CONSCIOUSNESS',
    description: 'Amount of cognitive load decay per interval',
  },
  {
    key: 'consciousness.max_connection_display',
    value: 3,
    type: 'NUMBER',
    category: 'CONSCIOUSNESS',
    description: 'Maximum number of connections to display',
  },
  {
    key: 'consciousness.base_confidence',
    value: 0.7,
    type: 'NUMBER',
    category: 'CONSCIOUSNESS',
    description: 'Base confidence level for calculations',
  },
  {
    key: 'consciousness.min_learning_rate',
    value: 0.05,
    type: 'NUMBER',
    category: 'CONSCIOUSNESS',
    description: 'Minimum learning rate',
  },
  {
    key: 'consciousness.max_learning_rate',
    value: 0.5,
    type: 'NUMBER',
    category: 'CONSCIOUSNESS',
    description: 'Maximum learning rate',
  },
  {
    key: 'consciousness.base_learning_rate',
    value: 0.2,
    type: 'NUMBER',
    category: 'CONSCIOUSNESS',
    description: 'Base learning rate',
  },

  // Validation Configuration
  {
    key: 'validation.default_max_length',
    value: 1000,
    type: 'NUMBER',
    category: 'VALIDATION',
    description: 'Default maximum length for string inputs',
  },
  {
    key: 'validation.max_key_length',
    value: 255,
    type: 'NUMBER',
    category: 'VALIDATION',
    description: 'Maximum length for memory keys',
  },
  {
    key: 'validation.max_search_query_length',
    value: 500,
    type: 'NUMBER',
    category: 'VALIDATION',
    description: 'Maximum length for search queries',
  },
  {
    key: 'validation.max_entity_name_length',
    value: 255,
    type: 'NUMBER',
    category: 'VALIDATION',
    description: 'Maximum length for entity names',
  },

  // Memory Tools Configuration
  {
    key: 'memory.max_tag_length',
    value: 100,
    type: 'NUMBER',
    category: 'MEMORY',
    description: 'Maximum length for memory tags',
  },
  {
    key: 'memory.max_entity_type_length',
    value: 100,
    type: 'NUMBER',
    category: 'MEMORY',
    description: 'Maximum length for entity types',
  },
  {
    key: 'memory.max_relationship_type_length',
    value: 100,
    type: 'NUMBER',
    category: 'MEMORY',
    description: 'Maximum length for relationship types',
  },
  {
    key: 'memory.max_access_count_normalization',
    value: 10,
    type: 'NUMBER',
    category: 'MEMORY',
    description: 'Maximum access count for normalization',
  },
  {
    key: 'memory.min_graph_depth',
    value: 1,
    type: 'NUMBER',
    category: 'MEMORY',
    description: 'Minimum graph depth for searches',
  },
  {
    key: 'memory.max_graph_depth',
    value: 5,
    type: 'NUMBER',
    category: 'MEMORY',
    description: 'Maximum graph depth for searches',
  },
  {
    key: 'memory.decimal_precision',
    value: 100,
    type: 'NUMBER',
    category: 'MEMORY',
    description: 'Decimal precision multiplier for scoring',
  },
  {
    key: 'memory.content_weight',
    value: 0.4,
    type: 'NUMBER',
    category: 'MEMORY',
    description: 'Weight for content matching in relevance scoring',
  },
  {
    key: 'memory.tag_weight',
    value: 0.3,
    type: 'NUMBER',
    category: 'MEMORY',
    description: 'Weight for tag matching in relevance scoring',
  },
  {
    key: 'memory.importance_weight',
    value: 0.2,
    type: 'NUMBER',
    category: 'MEMORY',
    description: 'Weight for importance in relevance scoring',
  },
  {
    key: 'memory.access_weight',
    value: 0.1,
    type: 'NUMBER',
    category: 'MEMORY',
    description: 'Weight for access count in relevance scoring',
  },

  // Reasoning Tools Configuration
  {
    key: 'reasoning.max_thought_length',
    value: 2000,
    type: 'NUMBER',
    category: 'REASONING',
    description: 'Maximum length for individual thoughts',
  },
  {
    key: 'reasoning.max_branch_id_length',
    value: 50,
    type: 'NUMBER',
    category: 'REASONING',
    description: 'Maximum length for branch identifiers',
  },
  {
    key: 'reasoning.summary_length',
    value: 200,
    type: 'NUMBER',
    category: 'REASONING',
    description: 'Length for thought summaries',
  },
  {
    key: 'reasoning.milliseconds_per_second',
    value: 1000,
    type: 'NUMBER',
    category: 'REASONING',
    description: 'Milliseconds per second conversion factor',
  },

  // Time Tools Configuration
  {
    key: 'time.deep_night_hour_threshold',
    value: 6,
    type: 'NUMBER',
    category: 'TIME',
    description: 'Hour threshold for deep night classification',
  },
  {
    key: 'time.morning_hour_threshold',
    value: 12,
    type: 'NUMBER',
    category: 'TIME',
    description: 'Hour threshold for morning classification',
  },
  {
    key: 'time.afternoon_hour_threshold',
    value: 18,
    type: 'NUMBER',
    category: 'TIME',
    description: 'Hour threshold for afternoon classification',
  },
  {
    key: 'time.evening_hour_threshold',
    value: 22,
    type: 'NUMBER',
    category: 'TIME',
    description: 'Hour threshold for evening classification',
  },
  {
    key: 'time.rest_hour_threshold',
    value: 6,
    type: 'NUMBER',
    category: 'TIME',
    description: 'Hour threshold for rest phase',
  },
  {
    key: 'time.awakening_hour_threshold',
    value: 9,
    type: 'NUMBER',
    category: 'TIME',
    description: 'Hour threshold for awakening phase',
  },
  {
    key: 'time.active_hour_threshold',
    value: 17,
    type: 'NUMBER',
    category: 'TIME',
    description: 'Hour threshold for active phase',
  },
  {
    key: 'time.winding_down_hour_threshold',
    value: 21,
    type: 'NUMBER',
    category: 'TIME',
    description: 'Hour threshold for winding down phase',
  },
  {
    key: 'time.milliseconds_per_second',
    value: 1000,
    type: 'NUMBER',
    category: 'TIME',
    description: 'Milliseconds per second conversion factor',
  },
];

export async function seedConfiguration(): Promise<void> {
  const configService = ConfigurationService.getInstance();

  console.log('Seeding configuration values...');

  for (const seed of CONFIGURATION_SEEDS) {
    try {
      await configService.setValue(seed.key, seed.value, seed.type, seed.category, seed.description);
      console.log(`✓ Seeded: ${seed.key} = ${seed.value}`);
    } catch (error) {
      console.error(`✗ Failed to seed ${seed.key}:`, error);
    }
  }

  console.log(`Configuration seeding complete. Seeded ${CONFIGURATION_SEEDS.length} values.`);
}

export { CONFIGURATION_SEEDS };
