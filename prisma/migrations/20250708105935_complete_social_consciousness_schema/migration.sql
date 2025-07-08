-- AlterTable
ALTER TABLE "memories" ADD COLUMN "related_entities" TEXT;
ALTER TABLE "memories" ADD COLUMN "social_context" TEXT;

-- CreateTable
CREATE TABLE "memory_social_links" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "memory_id" INTEGER NOT NULL,
    "social_entity_id" INTEGER,
    "interaction_id" INTEGER,
    "relationship_type" TEXT NOT NULL,
    "strength" REAL NOT NULL DEFAULT 0.8,
    "context" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "memory_social_links_memory_id_fkey" FOREIGN KEY ("memory_id") REFERENCES "memories" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "memory_social_links_social_entity_id_fkey" FOREIGN KEY ("social_entity_id") REFERENCES "social_entities" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "memory_social_links_interaction_id_fkey" FOREIGN KEY ("interaction_id") REFERENCES "social_interactions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "memory_social_links_memory_id_idx" ON "memory_social_links"("memory_id");

-- CreateIndex
CREATE INDEX "memory_social_links_social_entity_id_idx" ON "memory_social_links"("social_entity_id");

-- CreateIndex
CREATE INDEX "memory_social_links_relationship_type_idx" ON "memory_social_links"("relationship_type");
