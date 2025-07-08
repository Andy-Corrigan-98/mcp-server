-- CreateTable
CREATE TABLE "memories" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "key" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "importance" TEXT NOT NULL DEFAULT 'medium',
    "stored_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "access_count" INTEGER NOT NULL DEFAULT 0,
    "last_accessed" DATETIME
);

-- CreateTable
CREATE TABLE "knowledge_entities" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "properties" TEXT NOT NULL DEFAULT '{}',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "knowledge_relationships" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "source_entity_name" TEXT NOT NULL,
    "target_entity_name" TEXT NOT NULL,
    "relationship_type" TEXT NOT NULL,
    "strength" REAL NOT NULL DEFAULT 1.0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "knowledge_relationships_source_entity_name_fkey" FOREIGN KEY ("source_entity_name") REFERENCES "knowledge_entities" ("name") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "knowledge_relationships_target_entity_name_fkey" FOREIGN KEY ("target_entity_name") REFERENCES "knowledge_entities" ("name") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "social_entities" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "display_name" TEXT,
    "description" TEXT,
    "properties" TEXT NOT NULL DEFAULT '{}',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "last_interaction" DATETIME
);

-- CreateTable
CREATE TABLE "social_relationships" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "entity_id" INTEGER NOT NULL,
    "relationship_type" TEXT NOT NULL,
    "strength" REAL NOT NULL DEFAULT 0.5,
    "trust" REAL NOT NULL DEFAULT 0.5,
    "familiarity" REAL NOT NULL DEFAULT 0.1,
    "affinity" REAL NOT NULL DEFAULT 0.5,
    "communication_style" TEXT,
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "social_relationships_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "social_entities" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "social_interactions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "entity_id" INTEGER NOT NULL,
    "interaction_type" TEXT NOT NULL,
    "context" TEXT,
    "summary" TEXT,
    "duration" INTEGER,
    "quality" REAL DEFAULT 0.5,
    "learning_extracted" TEXT,
    "emotional_tone" TEXT NOT NULL DEFAULT 'neutral',
    "my_emotional_state" TEXT,
    "their_emotional_state" TEXT,
    "conversation_style" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "social_interactions_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "social_entities" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "emotional_contexts" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "entity_id" INTEGER,
    "interaction_id" INTEGER,
    "emotional_state" TEXT NOT NULL,
    "intensity" REAL NOT NULL DEFAULT 0.5,
    "trigger" TEXT,
    "response" TEXT,
    "learning" TEXT,
    "context" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "emotional_contexts_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "social_entities" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "emotional_contexts_interaction_id_fkey" FOREIGN KEY ("interaction_id") REFERENCES "social_interactions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "social_learnings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "entity_id" INTEGER,
    "learning_type" TEXT NOT NULL,
    "insight" TEXT NOT NULL,
    "confidence" REAL NOT NULL DEFAULT 0.8,
    "applicability" TEXT,
    "examples" TEXT,
    "effectiveness" REAL DEFAULT 0.5,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "social_learnings_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "social_entities" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "configurations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "defaultValue" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "memories_key_key" ON "memories"("key");

-- CreateIndex
CREATE UNIQUE INDEX "knowledge_entities_name_key" ON "knowledge_entities"("name");

-- CreateIndex
CREATE UNIQUE INDEX "knowledge_relationships_source_entity_name_target_entity_name_relationship_type_key" ON "knowledge_relationships"("source_entity_name", "target_entity_name", "relationship_type");

-- CreateIndex
CREATE UNIQUE INDEX "social_entities_name_key" ON "social_entities"("name");

-- CreateIndex
CREATE INDEX "social_interactions_entity_id_idx" ON "social_interactions"("entity_id");

-- CreateIndex
CREATE INDEX "social_interactions_interaction_type_idx" ON "social_interactions"("interaction_type");

-- CreateIndex
CREATE INDEX "social_interactions_created_at_idx" ON "social_interactions"("created_at");

-- CreateIndex
CREATE INDEX "emotional_contexts_emotional_state_idx" ON "emotional_contexts"("emotional_state");

-- CreateIndex
CREATE INDEX "emotional_contexts_entity_id_idx" ON "emotional_contexts"("entity_id");

-- CreateIndex
CREATE INDEX "social_learnings_learning_type_idx" ON "social_learnings"("learning_type");

-- CreateIndex
CREATE INDEX "social_learnings_entity_id_idx" ON "social_learnings"("entity_id");

-- CreateIndex
CREATE UNIQUE INDEX "configurations_key_key" ON "configurations"("key");

-- CreateIndex
CREATE INDEX "configurations_category_idx" ON "configurations"("category");

-- CreateIndex
CREATE INDEX "configurations_key_idx" ON "configurations"("key");
