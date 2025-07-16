-- CreateTable
CREATE TABLE "serendipitous_insights" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "source_concept" TEXT NOT NULL,
    "target_concept" TEXT NOT NULL,
    "connection_hypothesis" TEXT NOT NULL,
    "reasoning" TEXT NOT NULL,
    "novelty_score" REAL NOT NULL,
    "plausibility_score" REAL NOT NULL,
    "value_score" REAL NOT NULL,
    "overall_score" REAL NOT NULL,
    "sampling_strategy" TEXT NOT NULL,
    "generated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stored_in_memory" BOOLEAN NOT NULL DEFAULT false,
    "memory_key" TEXT,
    "source_entity_name" TEXT,
    "target_entity_name" TEXT,
    CONSTRAINT "serendipitous_insights_source_entity_name_fkey" FOREIGN KEY ("source_entity_name") REFERENCES "knowledge_entities" ("name") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "serendipitous_insights_target_entity_name_fkey" FOREIGN KEY ("target_entity_name") REFERENCES "knowledge_entities" ("name") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "serendipitous_insights_overall_score_idx" ON "serendipitous_insights"("overall_score");

-- CreateIndex
CREATE INDEX "serendipitous_insights_generated_at_idx" ON "serendipitous_insights"("generated_at");

-- CreateIndex
CREATE INDEX "serendipitous_insights_sampling_strategy_idx" ON "serendipitous_insights"("sampling_strategy");

-- CreateIndex
CREATE INDEX "serendipitous_insights_source_concept_target_concept_idx" ON "serendipitous_insights"("source_concept", "target_concept");
