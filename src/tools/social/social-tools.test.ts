import { describe, it, expect, beforeEach, beforeAll, afterEach } from '@jest/globals';
import { execute as executeSocialOperation } from '../../features/social/index.js';
import { seedConfiguration } from '@/db/seed-configuration.js';
import { ConsciousnessPrismaService } from '@/db/prisma-service.js';
import type { PrismaClient } from '@prisma/client';

describe('FunctionalSocialTools', () => {
  let prismaService: ConsciousnessPrismaService;
  let prisma: PrismaClient;

  beforeAll(async () => {
    await seedConfiguration();
    prismaService = ConsciousnessPrismaService.getInstance();
    // Access the internal prisma client directly for test cleanup
    prisma = (prismaService as any).prisma;
  });

  beforeEach(async () => {
    // Clean up test data before each test
    await prisma.socialRelationship.deleteMany({
      where: {
        entity: {
          name: { contains: 'test_' },
        },
      },
    });
    await prisma.socialEntity.deleteMany({
      where: {
        name: { contains: 'test_' },
      },
    });
  });

  afterEach(async () => {
    // Clean up test data after each test
    await prisma.socialRelationship.deleteMany({
      where: {
        entity: {
          name: { contains: 'test_' },
        },
      },
    });
    await prisma.socialEntity.deleteMany({
      where: {
        name: { contains: 'test_' },
      },
    });
  });

  describe('Entity Management', () => {
    describe('social_entity_create', () => {
      it('should create a basic entity with required fields', async () => {
        const entityName = 'test_basic_entity';
        const entityType = 'person';

        const result = await executeSocialOperation('social_entity_create', {
          name: entityName,
          entity_type: entityType,
        });

        expect(result).toHaveProperty('success', true);
        expect(result).toHaveProperty('entity', entityName);
        expect(result).toHaveProperty('entity_id');

        // Verify stored in database
        const storedEntity = await prisma.socialEntity.findUnique({
          where: { name: entityName },
        });
        expect(storedEntity).toBeTruthy();
        expect(storedEntity?.entityType).toBe(entityType);
        expect(storedEntity?.displayName).toBeNull();
        expect(storedEntity?.description).toBeNull();
      });

      it('should create entity with full details', async () => {
        const entityName = 'test_full_entity';
        const entityType = 'organization'; // Changed from 'colleague' to valid enum
        const displayName = 'Test Organization (Full Details)';
        const description = 'A test organization entity with full details for testing';
        const properties = {
          expertise: ['testing', 'development'],
          timezone: 'UTC',
          communication_style: 'direct',
        };

        const result = await executeSocialOperation('social_entity_create', {
          name: entityName,
          entity_type: entityType,
          display_name: displayName,
          description: description,
          properties: properties,
        });

        expect(result).toHaveProperty('success', true);
        expect(result).toHaveProperty('entity', entityName);
        expect(result).toHaveProperty('display_name', displayName);

        // Verify stored in database
        const storedEntity = await prisma.socialEntity.findUnique({
          where: { name: entityName },
        });
        expect(storedEntity).toBeTruthy();
        expect(storedEntity?.entityType).toBe(entityType);
        expect(storedEntity?.displayName).toBe(displayName);
        expect(storedEntity?.description).toBe(description);
        expect(JSON.parse(storedEntity?.properties || '{}')).toEqual(properties);
      });

      it('should handle different entity types', async () => {
        const entityTypes = ['person', 'group', 'community', 'organization'];

        for (const entityType of entityTypes) {
          const entityName = `test_${entityType}_entity`;

          const result = await executeSocialOperation('social_entity_create', {
            name: entityName,
            entity_type: entityType,
          });

          expect(result).toHaveProperty('success', true);
          expect(result).toHaveProperty('entity_type', entityType);

          // Verify in database
          const storedEntity = await prisma.socialEntity.findUnique({
            where: { name: entityName },
          });
          expect(storedEntity?.entityType).toBe(entityType);
        }
      });

      it('should reject duplicate entity names', async () => {
        const entityName = 'test_duplicate_entity';

        // Create first entity
        await executeSocialOperation('social_entity_create', {
          name: entityName,
          entity_type: 'person',
        });

        // Attempt to create duplicate
        await expect(
          executeSocialOperation('social_entity_create', {
            name: entityName,
            entity_type: 'group',
          })
        ).rejects.toThrow(`Social entity '${entityName}' already exists`);
      });

      it('should validate required fields', async () => {
        await expect(executeSocialOperation('social_entity_create', {})).rejects.toThrow();

        await expect(
          executeSocialOperation('social_entity_create', {
            name: 'test_entity',
          })
        ).rejects.toThrow();
      });
    });

    describe('social_entity_update', () => {
      beforeEach(async () => {
        // Create a test entity to update
        await executeSocialOperation('social_entity_create', {
          name: 'test_update_entity',
          entity_type: 'person',
          display_name: 'Original Name',
          description: 'Original description',
          properties: { version: 1 },
        });
      });

      it('should update entity display name', async () => {
        const newDisplayName = 'Updated Display Name';

        const result = await executeSocialOperation('social_entity_update', {
          name: 'test_update_entity',
          display_name: newDisplayName,
        });

        expect(result).toHaveProperty('success', true);
        expect(result).toHaveProperty('entity', 'test_update_entity');
        expect(result).toHaveProperty('updated');

        // Verify in database
        const updatedEntity = await prisma.socialEntity.findUnique({
          where: { name: 'test_update_entity' },
        });
        expect(updatedEntity?.displayName).toBe(newDisplayName);
      });

      it('should update entity description', async () => {
        const newDescription = 'Updated description with more details';

        const result = await executeSocialOperation('social_entity_update', {
          name: 'test_update_entity',
          description: newDescription,
        });

        expect(result).toHaveProperty('success', true);

        // Verify in database
        const updatedEntity = await prisma.socialEntity.findUnique({
          where: { name: 'test_update_entity' },
        });
        expect(updatedEntity?.description).toBe(newDescription);
      });

      it('should merge properties', async () => {
        const additionalProperties = {
          version: 2,
          new_field: 'added_value',
          communication_preference: 'async',
        };

        const result = await executeSocialOperation('social_entity_update', {
          name: 'test_update_entity',
          properties: additionalProperties,
        });

        expect(result).toHaveProperty('success', true);

        // Verify properties are merged in database
        const updatedEntity = await prisma.socialEntity.findUnique({
          where: { name: 'test_update_entity' },
        });
        const storedProperties = JSON.parse(updatedEntity?.properties || '{}');
        expect(storedProperties).toEqual(additionalProperties);
      });

      it('should handle non-existent entity', async () => {
        await expect(
          executeSocialOperation('social_entity_update', {
            name: 'test_nonexistent_entity',
            display_name: 'Should Fail',
          })
        ).rejects.toThrow(`Social entity 'test_nonexistent_entity' not found`);
      });
    });

    describe('social_entity_get', () => {
      beforeEach(async () => {
        // Create test entity
        await executeSocialOperation('social_entity_create', {
          name: 'test_get_entity',
          entity_type: 'person',
          display_name: 'Test Get Entity',
          description: 'Entity for retrieval testing',
          properties: {
            role: 'tester',
            experience: 'beginner',
          },
        });
      });

      it('should retrieve basic entity information', async () => {
        const result = await executeSocialOperation('social_entity_get', {
          name: 'test_get_entity',
        });

        expect(result).toHaveProperty('entity');

        const resultObj = result as any;
        expect(resultObj.entity.name).toBe('test_get_entity');
        expect(resultObj.entity.entityType).toBe('person');
        expect(resultObj.entity.displayName).toBe('Test Get Entity');
        expect(resultObj.entity.description).toBe('Entity for retrieval testing');
      });

      it('should handle non-existent entity', async () => {
        await expect(
          executeSocialOperation('social_entity_get', {
            name: 'test_nonexistent_entity',
          })
        ).rejects.toThrow(`Social entity 'test_nonexistent_entity' not found`);
      });
    });
  });

  describe('Relationship Management', () => {
    beforeEach(async () => {
      // Create test entities for relationship tests
      await executeSocialOperation('social_entity_create', {
        name: 'test_relationship_entity',
        entity_type: 'person',
        display_name: 'Test Relationship Person',
      });
    });

    describe('social_relationship_create', () => {
      it('should create a basic relationship with defaults', async () => {
        const result = await executeSocialOperation('social_relationship_create', {
          entity_name: 'test_relationship_entity',
          relationship_type: 'colleague',
        });

        expect(result).toHaveProperty('success', true);
        expect(result).toHaveProperty('entity', 'test_relationship_entity');
        expect(result).toHaveProperty('relationship_type', 'colleague');
        expect(result).toHaveProperty('relationship_id');

        // Verify in database
        const entity = await prisma.socialEntity.findUnique({
          where: { name: 'test_relationship_entity' },
        });
        const relationship = await prisma.socialRelationship.findFirst({
          where: { entityId: entity!.id },
        });

        expect(relationship).toBeTruthy();
        expect(relationship?.relationshipType).toBe('colleague');
        expect(relationship?.strength).toBe(0.5); // default
        expect(relationship?.trust).toBe(0.5); // default
        expect(relationship?.familiarity).toBe(0.1); // default
        expect(relationship?.affinity).toBe(0.5); // default
      });

      it('should create relationship with custom values', async () => {
        const customRelationship = {
          entity_name: 'test_relationship_entity',
          relationship_type: 'mentor',
          strength: 0.8,
          trust: 0.9,
          familiarity: 0.7,
          affinity: 0.85,
          communication_style: {
            preferred_method: 'video_call',
            response_time: 'within_day',
            discussion_style: 'collaborative',
          },
          notes: 'Excellent mentor with deep technical knowledge',
        };

        const result = await executeSocialOperation('social_relationship_create', customRelationship);

        expect(result).toHaveProperty('success', true);
        expect(result).toHaveProperty('relationship_type', 'mentor');

        // Verify in database
        const entity = await prisma.socialEntity.findUnique({
          where: { name: 'test_relationship_entity' },
        });
        const relationship = await prisma.socialRelationship.findFirst({
          where: { entityId: entity!.id },
        });

        expect(relationship?.strength).toBe(0.8);
        expect(relationship?.trust).toBe(0.9);
        expect(relationship?.familiarity).toBe(0.7);
        expect(relationship?.affinity).toBe(0.85);
        expect(relationship?.notes).toBe('Excellent mentor with deep technical knowledge');

        const communicationStyle = JSON.parse(relationship?.communicationStyle || '{}');
        expect(communicationStyle.preferred_method).toBe('video_call');
      });

      it('should handle different relationship types', async () => {
        const relationshipTypes = ['friend', 'colleague', 'mentor', 'family'];

        for (let i = 0; i < relationshipTypes.length; i++) {
          const relationshipType = relationshipTypes[i];
          const entityName = `test_relationship_entity_${i}`;

          // Create entity for this test
          await executeSocialOperation('social_entity_create', {
            name: entityName,
            entity_type: 'person',
          });

          const result = await executeSocialOperation('social_relationship_create', {
            entity_name: entityName,
            relationship_type: relationshipType,
          });

          expect(result).toHaveProperty('relationship_type', relationshipType);
        }
      });

      it('should reject duplicate relationships', async () => {
        // Create first relationship
        await executeSocialOperation('social_relationship_create', {
          entity_name: 'test_relationship_entity',
          relationship_type: 'colleague',
        });

        // Attempt to create duplicate
        await expect(
          executeSocialOperation('social_relationship_create', {
            entity_name: 'test_relationship_entity',
            relationship_type: 'friend',
          })
        ).rejects.toThrow(`Relationship already exists for entity 'test_relationship_entity'`);
      });

      it('should handle non-existent entity', async () => {
        await expect(
          executeSocialOperation('social_relationship_create', {
            entity_name: 'test_nonexistent_entity',
            relationship_type: 'colleague',
          })
        ).rejects.toThrow(`Social entity 'test_nonexistent_entity' not found`);
      });
    });

    describe('social_relationship_update', () => {
      beforeEach(async () => {
        // Create relationship to update
        await executeSocialOperation('social_relationship_create', {
          entity_name: 'test_relationship_entity',
          relationship_type: 'colleague',
          strength: 0.5,
          trust: 0.5,
          notes: 'Initial notes',
        });
      });

      it('should update relationship metrics', async () => {
        const result = await executeSocialOperation('social_relationship_update', {
          entity_name: 'test_relationship_entity',
          strength: 0.8,
          trust: 0.9,
          familiarity: 0.7,
          reason: 'Successful collaboration increased trust and familiarity',
        });

        expect(result).toHaveProperty('success', true);
        expect(result).toHaveProperty('entity', 'test_relationship_entity');
        expect(result).toHaveProperty('updated');

        // Verify in database
        const entity = await prisma.socialEntity.findUnique({
          where: { name: 'test_relationship_entity' },
        });
        const relationship = await prisma.socialRelationship.findFirst({
          where: { entityId: entity!.id },
        });

        expect(relationship?.strength).toBe(0.8);
        expect(relationship?.trust).toBe(0.9);
        expect(relationship?.familiarity).toBe(0.7);
      });

      it('should update communication style', async () => {
        const newCommunicationStyle = {
          discovered_pattern: 'prefers_structured_discussions',
          best_time: 'mornings',
          response_style: 'thoughtful_detailed',
        };

        const result = await executeSocialOperation('social_relationship_update', {
          entity_name: 'test_relationship_entity',
          communication_style: newCommunicationStyle,
          reason: 'Learned communication preferences through interaction',
        });

        expect(result).toHaveProperty('success', true);

        // Verify in database
        const entity = await prisma.socialEntity.findUnique({
          where: { name: 'test_relationship_entity' },
        });
        const relationship = await prisma.socialRelationship.findFirst({
          where: { entityId: entity!.id },
        });

        const storedStyle = JSON.parse(relationship?.communicationStyle || '{}');
        expect(storedStyle).toEqual(newCommunicationStyle);
      });

      it('should update notes', async () => {
        const newNotes = 'Updated notes with more insights about working style';

        const result = await executeSocialOperation('social_relationship_update', {
          entity_name: 'test_relationship_entity',
          notes: newNotes,
          reason: 'Added insights from recent collaboration',
        });

        expect(result).toHaveProperty('success', true);

        // Verify in database
        const entity = await prisma.socialEntity.findUnique({
          where: { name: 'test_relationship_entity' },
        });
        const relationship = await prisma.socialRelationship.findFirst({
          where: { entityId: entity!.id },
        });

        expect(relationship?.notes).toBe(newNotes);
      });

      it('should handle non-existent entity', async () => {
        await expect(
          executeSocialOperation('social_relationship_update', {
            entity_name: 'test_nonexistent_entity',
            strength: 0.8,
          })
        ).rejects.toThrow(`Social entity 'test_nonexistent_entity' not found`);
      });

      it('should handle entity without relationship', async () => {
        // Create entity without relationship
        await executeSocialOperation('social_entity_create', {
          name: 'test_no_relationship_entity',
          entity_type: 'person',
        });

        await expect(
          executeSocialOperation('social_relationship_update', {
            entity_name: 'test_no_relationship_entity',
            strength: 0.8,
          })
        ).rejects.toThrow(`No relationship found for entity 'test_no_relationship_entity'`);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle unknown tool names', async () => {
      await expect(executeSocialOperation('unknown_social_tool', {})).rejects.toThrow(
        'Unknown social tool: unknown_social_tool'
      );
    });

    it('should handle missing entity in interaction record', async () => {
      await expect(
        executeSocialOperation('social_interaction_record', {
          entity_name: 'test_nonexistent_entity',
          interaction_type: 'conversation',
        })
      ).rejects.toThrow(`Social entity 'test_nonexistent_entity' not found`);
    });
  });
});
