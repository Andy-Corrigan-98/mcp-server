import Database from 'better-sqlite3';
import { readFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export interface MemoryEntry {
  id?: number;
  key: string;
  content: string;
  tags: string;
  importance: 'low' | 'medium' | 'high' | 'critical';
  stored_at: string;
  access_count: number;
  last_accessed: string | null;
}

export interface KnowledgeEntity {
  id?: number;
  name: string;
  entity_type: string;
  properties: string;
  created_at: string;
  updated_at: string;
}

export interface KnowledgeRelationship {
  id?: number;
  source_entity: string;
  target_entity: string;
  relationship_type: string;
  strength: number;
  created_at: string;
}

export class ConsciousnessDatabase {
  private db: Database.Database;
  private static instance: ConsciousnessDatabase;

  constructor() {
    const dbPath = process.env.DATABASE_PATH || '/app/data/consciousness.db';
    const dbDebug = process.env.DB_DEBUG === 'true';
    
    // Ensure directory exists
    const dbDir = dirname(dbPath);
    try {
      mkdirSync(dbDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }

    this.db = new Database(dbPath, {
      verbose: dbDebug ? console.log : undefined,
    });

    this.initializeSchema();
  }

  static getInstance(): ConsciousnessDatabase {
    if (!ConsciousnessDatabase.instance) {
      ConsciousnessDatabase.instance = new ConsciousnessDatabase();
    }
    return ConsciousnessDatabase.instance;
  }

  private initializeSchema(): void {
    // Enable foreign keys
    this.db.pragma('foreign_keys = ON');

    // Create memories table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS memories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL,
        content TEXT NOT NULL,
        tags TEXT NOT NULL DEFAULT '[]',
        importance TEXT NOT NULL DEFAULT 'medium',
        stored_at TEXT NOT NULL,
        access_count INTEGER NOT NULL DEFAULT 0,
        last_accessed TEXT,
        CONSTRAINT check_importance CHECK (importance IN ('low', 'medium', 'high', 'critical'))
      )
    `);

    // Create knowledge entities table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS knowledge_entities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        entity_type TEXT NOT NULL,
        properties TEXT NOT NULL DEFAULT '{}',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);

    // Create knowledge relationships table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS knowledge_relationships (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        source_entity TEXT NOT NULL,
        target_entity TEXT NOT NULL,
        relationship_type TEXT NOT NULL,
        strength REAL NOT NULL DEFAULT 1.0,
        created_at TEXT NOT NULL,
        FOREIGN KEY (source_entity) REFERENCES knowledge_entities (name),
        FOREIGN KEY (target_entity) REFERENCES knowledge_entities (name),
        UNIQUE(source_entity, target_entity, relationship_type)
      )
    `);

    // Create indexes for better performance
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_memories_key ON memories(key);
      CREATE INDEX IF NOT EXISTS idx_memories_importance ON memories(importance);
      CREATE INDEX IF NOT EXISTS idx_memories_stored_at ON memories(stored_at);
      CREATE INDEX IF NOT EXISTS idx_knowledge_entities_name ON knowledge_entities(name);
      CREATE INDEX IF NOT EXISTS idx_knowledge_entities_type ON knowledge_entities(entity_type);
      CREATE INDEX IF NOT EXISTS idx_knowledge_relationships_source ON knowledge_relationships(source_entity);
      CREATE INDEX IF NOT EXISTS idx_knowledge_relationships_target ON knowledge_relationships(target_entity);
    `);
  }

  // Memory operations
  storeMemory(entry: Omit<MemoryEntry, 'id'>): MemoryEntry {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO memories (key, content, tags, importance, stored_at, access_count, last_accessed)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      entry.key,
      entry.content,
      entry.tags,
      entry.importance,
      entry.stored_at,
      entry.access_count,
      entry.last_accessed
    );

    return { ...entry, id: result.lastInsertRowid as number };
  }

  retrieveMemory(key: string): MemoryEntry | null {
    const stmt = this.db.prepare('SELECT * FROM memories WHERE key = ?');
    const memory = stmt.get(key) as MemoryEntry | undefined;

    if (memory) {
      // Update access tracking
      const updateStmt = this.db.prepare(`
        UPDATE memories 
        SET access_count = access_count + 1, last_accessed = ? 
        WHERE key = ?
      `);
      updateStmt.run(new Date().toISOString(), key);
      memory.access_count++;
      memory.last_accessed = new Date().toISOString();
    }

    return memory || null;
  }

  searchMemories(query?: string, tags?: string[], importanceFilter?: string): MemoryEntry[] {
    let sql = 'SELECT * FROM memories WHERE 1=1';
    const params: any[] = [];

    if (importanceFilter) {
      const importanceOrder = ['low', 'medium', 'high', 'critical'];
      const filterIndex = importanceOrder.indexOf(importanceFilter);
      if (filterIndex >= 0) {
        const validImportances = importanceOrder.slice(filterIndex);
        sql += ` AND importance IN (${validImportances.map(() => '?').join(',')})`;
        params.push(...validImportances);
      }
    }

    if (query) {
      sql += ' AND (content LIKE ? OR key LIKE ?)';
      params.push(`%${query}%`, `%${query}%`);
    }

    if (tags && tags.length > 0) {
      // Simple tag matching - could be improved with JSON functions
      const tagConditions = tags.map(() => 'tags LIKE ?').join(' OR ');
      sql += ` AND (${tagConditions})`;
      params.push(...tags.map(tag => `%"${tag}"%`));
    }

    sql += ' ORDER BY importance DESC, stored_at DESC';

    const stmt = this.db.prepare(sql);
    return stmt.all(...params) as MemoryEntry[];
  }

  // Knowledge graph operations
  addEntity(entity: Omit<KnowledgeEntity, 'id'>): KnowledgeEntity {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO knowledge_entities (name, entity_type, properties, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      entity.name,
      entity.entity_type,
      entity.properties,
      entity.created_at,
      entity.updated_at
    );

    return { ...entity, id: result.lastInsertRowid as number };
  }

  addRelationship(relationship: Omit<KnowledgeRelationship, 'id'>): KnowledgeRelationship {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO knowledge_relationships 
      (source_entity, target_entity, relationship_type, strength, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      relationship.source_entity,
      relationship.target_entity,
      relationship.relationship_type,
      relationship.strength,
      relationship.created_at
    );

    return { ...relationship, id: result.lastInsertRowid as number };
  }

  getEntity(name: string): KnowledgeEntity | null {
    const stmt = this.db.prepare('SELECT * FROM knowledge_entities WHERE name = ?');
    return stmt.get(name) as KnowledgeEntity | null;
  }

  getEntityRelationships(entityName: string, depth: number = 2): any {
    // Recursive CTE to traverse relationships
    const stmt = this.db.prepare(`
      WITH RECURSIVE entity_graph(entity, level, path) AS (
        SELECT ? as entity, 0 as level, ? as path
        UNION ALL
        SELECT 
          CASE 
            WHEN kr.source_entity = eg.entity THEN kr.target_entity
            ELSE kr.source_entity
          END as entity,
          eg.level + 1 as level,
          eg.path || ' -> ' || CASE 
            WHEN kr.source_entity = eg.entity THEN kr.target_entity
            ELSE kr.source_entity
          END as path
        FROM entity_graph eg
        JOIN knowledge_relationships kr ON (
          kr.source_entity = eg.entity OR kr.target_entity = eg.entity
        )
        WHERE eg.level < ? AND eg.path NOT LIKE '%' || CASE 
          WHEN kr.source_entity = eg.entity THEN kr.target_entity
          ELSE kr.source_entity
        END || '%'
      )
      SELECT DISTINCT 
        eg.entity,
        eg.level,
        ke.entity_type,
        ke.properties,
        kr.relationship_type,
        kr.strength
      FROM entity_graph eg
      JOIN knowledge_entities ke ON ke.name = eg.entity
      LEFT JOIN knowledge_relationships kr ON (
        (kr.source_entity = ? AND kr.target_entity = eg.entity) OR
        (kr.target_entity = ? AND kr.source_entity = eg.entity)
      )
      ORDER BY eg.level, eg.entity
    `);

    return stmt.all(entityName, entityName, depth, entityName, entityName);
  }

  getMemoryCount(): number {
    const stmt = this.db.prepare('SELECT COUNT(*) as count FROM memories');
    return (stmt.get() as any).count;
  }

  close(): void {
    this.db.close();
  }
} 