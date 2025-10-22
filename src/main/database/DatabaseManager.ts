/**
 * 数据库管理器
 * 阶段 2: 文件系统与数据库
 */

import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';

export interface QueryResult<T = any> {
  changes: number;
  lastID: number;
}

export interface IDatabaseManager {
  // 初始化数据库
  initialize(): Promise<void>;
  
  // 执行查询
  query<T = any>(sql: string, params?: any[]): Promise<T[]>;
  
  // 执行单条查询
  queryOne<T = any>(sql: string, params?: any[]): Promise<T | null>;
  
  // 执行更新/插入/删除
  execute(sql: string, params?: any[]): Promise<QueryResult>;
  
  // 批量执行
  executeBatch(statements: Array<{ sql: string; params?: any[] }>): Promise<void>;
  
  // 事务
  transaction<T>(callback: () => Promise<T>): Promise<T>;
  
  // 关闭数据库
  close(): Promise<void>;
  
  // 获取数据库实例（仅供内部使用）
  getDatabase(): Database.Database | null;
}

export class DatabaseManager implements IDatabaseManager {
  private db: Database.Database | null = null;
  private dbPath: string;

  constructor(dbPath?: string) {
    // 默认数据库路径：workspace/memorynote.db
    this.dbPath = dbPath || path.join(app.getPath('userData'), 'workspace', 'memorynote.db');
  }

  /**
   * 初始化数据库
   */
  async initialize(): Promise<void> {
    try {
      console.log(`Initializing database at: ${this.dbPath}`);
      
      // 创建数据库连接
      this.db = new Database(this.dbPath, {
        verbose: process.env.NODE_ENV === 'development' ? console.log : undefined,
      });

      // 启用外键约束
      this.db.pragma('foreign_keys = ON');
      
      // 运行迁移
      await this.runMigrations();
      
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  /**
   * 运行数据库迁移
   */
  private async runMigrations(): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    // 创建版本管理表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        version INTEGER UNIQUE NOT NULL,
        name TEXT NOT NULL,
        applied_at INTEGER NOT NULL
      );
    `);

    // 获取当前版本
    const currentVersion = this.db.prepare('SELECT MAX(version) as version FROM _migrations').get() as { version: number | null };
    const version = currentVersion?.version || 0;

    console.log(`Current database version: ${version}`);

    // 运行迁移
    const migrations = this.getMigrations();
    for (const migration of migrations) {
      if (migration.version > version) {
        console.log(`Running migration ${migration.version}: ${migration.name}`);
        this.db.exec(migration.sql);
        this.db.prepare('INSERT INTO _migrations (version, name, applied_at) VALUES (?, ?, ?)').run(
          migration.version,
          migration.name,
          Date.now()
        );
      }
    }
  }

  /**
   * 获取所有迁移脚本
   */
  private getMigrations(): Array<{ version: number; name: string; sql: string }> {
    return [
      {
        version: 1,
        name: 'initial_schema',
        sql: `
          -- 笔记表
          CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            path TEXT UNIQUE NOT NULL,
            content TEXT,
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL,
            deleted_at INTEGER,
            metadata TEXT
          );

          -- 创建索引
          CREATE INDEX IF NOT EXISTS idx_notes_path ON notes(path);
          CREATE INDEX IF NOT EXISTS idx_notes_deleted_at ON notes(deleted_at);
          CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON notes(updated_at);

          -- 复习卡片表
          CREATE TABLE IF NOT EXISTS review_cards (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            note_id INTEGER NOT NULL,
            content TEXT NOT NULL,
            type TEXT NOT NULL CHECK(type IN ('added', 'modified', 'deleted')),
            difficulty INTEGER DEFAULT 0,
            interval INTEGER DEFAULT 0,
            next_review INTEGER NOT NULL,
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL,
            metadata TEXT,
            FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE
          );

          -- 创建索引
          CREATE INDEX IF NOT EXISTS idx_review_cards_note_id ON review_cards(note_id);
          CREATE INDEX IF NOT EXISTS idx_review_cards_next_review ON review_cards(next_review);

          -- 复习历史表
          CREATE TABLE IF NOT EXISTS review_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            card_id INTEGER NOT NULL,
            quality INTEGER NOT NULL CHECK(quality >= 0 AND quality <= 5),
            reviewed_at INTEGER NOT NULL,
            time_spent INTEGER,
            FOREIGN KEY (card_id) REFERENCES review_cards(id) ON DELETE CASCADE
          );

          -- 创建索引
          CREATE INDEX IF NOT EXISTS idx_review_history_card_id ON review_history(card_id);
          CREATE INDEX IF NOT EXISTS idx_review_history_reviewed_at ON review_history(reviewed_at);

          -- 标签表
          CREATE TABLE IF NOT EXISTS tags (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            color TEXT,
            created_at INTEGER NOT NULL
          );

          -- 创建索引
          CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);

          -- 笔记标签关联表
          CREATE TABLE IF NOT EXISTS note_tags (
            note_id INTEGER NOT NULL,
            tag_id INTEGER NOT NULL,
            PRIMARY KEY (note_id, tag_id),
            FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
            FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
          );

          -- 插件配置表
          CREATE TABLE IF NOT EXISTS plugin_configs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            plugin_id TEXT UNIQUE NOT NULL,
            enabled INTEGER DEFAULT 1,
            config TEXT,
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL
          );

          -- 创建索引
          CREATE INDEX IF NOT EXISTS idx_plugin_configs_plugin_id ON plugin_configs(plugin_id);
        `,
      },
    ];
  }

  /**
   * 执行查询（返回多行）
   */
  async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      const stmt = this.db.prepare(sql);
      return stmt.all(...params) as T[];
    } catch (error) {
      console.error('Query error:', error, { sql, params });
      throw error;
    }
  }

  /**
   * 执行查询（返回单行）
   */
  async queryOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      const stmt = this.db.prepare(sql);
      const result = stmt.get(...params);
      return (result as T) || null;
    } catch (error) {
      console.error('QueryOne error:', error, { sql, params });
      throw error;
    }
  }

  /**
   * 执行更新/插入/删除
   */
  async execute(sql: string, params: any[] = []): Promise<QueryResult> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      const stmt = this.db.prepare(sql);
      const result = stmt.run(...params);
      return {
        changes: result.changes,
        lastID: result.lastInsertRowid as number,
      };
    } catch (error) {
      console.error('Execute error:', error, { sql, params });
      throw error;
    }
  }

  /**
   * 批量执行
   */
  async executeBatch(statements: Array<{ sql: string; params?: any[] }>): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const transaction = this.db.transaction(() => {
      for (const { sql, params = [] } of statements) {
        const stmt = this.db!.prepare(sql);
        stmt.run(...params);
      }
    });

    try {
      transaction();
    } catch (error) {
      console.error('ExecuteBatch error:', error);
      throw error;
    }
  }

  /**
   * 执行事务
   */
  async transaction<T>(callback: () => Promise<T>): Promise<T> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const transaction = this.db.transaction(async () => {
      return await callback();
    });

    try {
      return transaction();
    } catch (error) {
      console.error('Transaction error:', error);
      throw error;
    }
  }

  /**
   * 关闭数据库
   */
  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
      console.log('Database closed');
    }
  }

  /**
   * 获取数据库实例（仅供内部使用）
   */
  getDatabase(): Database.Database | null {
    return this.db;
  }
}

// 单例
let instance: DatabaseManager | null = null;

/**
 * 获取 DatabaseManager 单例
 */
export const getInstance = (): DatabaseManager => {
  if (!instance) {
    instance = new DatabaseManager();
  }
  return instance;
};

/**
 * 初始化数据库（在应用启动时调用）
 */
export const initDatabaseService = async (): Promise<void> => {
  const db = getInstance();
  await db.initialize();
};

