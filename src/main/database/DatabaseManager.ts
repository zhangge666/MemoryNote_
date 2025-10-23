/**
 * 数据库管理器
 * 阶段 2: 文件系统与数据库
 */

import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';
import { ConfigService } from '../services/ConfigService';

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
    if (dbPath) {
      // 使用提供的路径
      this.dbPath = dbPath;
    } else {
      // 从配置中读取工作区路径
      this.dbPath = this.getWorkspaceDatabasePath();
    }
  }
  
  /**
   * 从配置获取数据库路径
   */
  private getWorkspaceDatabasePath(): string {
    const configService = ConfigService.getInstance();
    const appConfig = configService.get('app');
    
    if (appConfig && appConfig.workspace) {
      // 使用配置的工作区路径
      return path.join(appConfig.workspace, 'memorynote.db');
    }
    
    // 降级到默认路径
    return path.join(app.getPath('userData'), 'workspace', 'memorynote.db');
  }

  /**
   * 初始化数据库
   */
  async initialize(): Promise<void> {
    try {
      // 创建数据库连接
      this.db = new Database(this.dbPath);

      // 启用外键约束
      this.db.pragma('foreign_keys = ON');
      
      // 运行迁移
      await this.runMigrations();
    } catch (error) {
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

    // 运行迁移
    const migrations = this.getMigrations();
    for (const migration of migrations) {
      if (migration.version > version) {
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
      {
        version: 2,
        name: 'note_management_tables',
        sql: `
          -- 笔记文件夹表
          CREATE TABLE IF NOT EXISTS folders (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            parent_id TEXT,
            path TEXT NOT NULL UNIQUE,
            icon TEXT,
            color TEXT,
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL,
            FOREIGN KEY (parent_id) REFERENCES folders(id) ON DELETE CASCADE
          );

          -- 重建笔记表，使用 TEXT 类型 ID
          DROP TABLE IF EXISTS notes;
          CREATE TABLE notes (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            file_path TEXT NOT NULL UNIQUE,
            folder_id TEXT,
            content TEXT,
            excerpt TEXT,
            is_pinned INTEGER DEFAULT 0,
            is_archived INTEGER DEFAULT 0,
            is_favorite INTEGER DEFAULT 0,
            word_count INTEGER DEFAULT 0,
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL,
            accessed_at INTEGER,
            FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE SET NULL
          );

          -- 重建标签表，使用 TEXT 类型 ID
          DROP TABLE IF EXISTS tags;
          CREATE TABLE tags (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            color TEXT,
            created_at INTEGER NOT NULL
          );

          -- 重建笔记-标签关联表
          DROP TABLE IF EXISTS note_tags;
          CREATE TABLE note_tags (
            note_id TEXT NOT NULL,
            tag_id TEXT NOT NULL,
            created_at INTEGER NOT NULL,
            PRIMARY KEY (note_id, tag_id),
            FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
            FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
          );

          -- 创建索引
          CREATE INDEX IF NOT EXISTS idx_notes_folder_id ON notes(folder_id);
          CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at DESC);
          CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON notes(updated_at DESC);
          CREATE INDEX IF NOT EXISTS idx_notes_is_pinned ON notes(is_pinned);
          CREATE INDEX IF NOT EXISTS idx_notes_is_archived ON notes(is_archived);
          CREATE INDEX IF NOT EXISTS idx_folders_parent_id ON folders(parent_id);
          CREATE INDEX IF NOT EXISTS idx_folders_path ON folders(path);

          -- 全文搜索
          CREATE VIRTUAL TABLE IF NOT EXISTS notes_fts USING fts5(
            title,
            content,
            content='notes',
            content_rowid='rowid'
          );

          -- 触发器：插入笔记时同步到 FTS
          CREATE TRIGGER IF NOT EXISTS notes_fts_insert AFTER INSERT ON notes BEGIN
            INSERT INTO notes_fts(rowid, title, content)
            VALUES (NEW.rowid, NEW.title, NEW.content);
          END;

          -- 触发器：更新笔记时同步到 FTS
          CREATE TRIGGER IF NOT EXISTS notes_fts_update AFTER UPDATE ON notes BEGIN
            UPDATE notes_fts SET title = NEW.title, content = NEW.content
            WHERE rowid = NEW.rowid;
          END;

          -- 触发器：删除笔记时同步到 FTS
          CREATE TRIGGER IF NOT EXISTS notes_fts_delete AFTER DELETE ON notes BEGIN
            DELETE FROM notes_fts WHERE rowid = OLD.rowid;
          END;
        `,
      },
      {
        version: 3,
        name: 'remove_content_from_notes',
        sql: `
          -- 移除 content 字段，改为从文件系统读取
          -- 创建新表（不包含 content 字段）
          CREATE TABLE notes_new (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            file_path TEXT NOT NULL UNIQUE,
            folder_id TEXT,
            excerpt TEXT,
            is_pinned INTEGER DEFAULT 0,
            is_archived INTEGER DEFAULT 0,
            is_favorite INTEGER DEFAULT 0,
            word_count INTEGER DEFAULT 0,
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL,
            accessed_at INTEGER,
            FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE SET NULL
          );

          -- 迁移数据（不包括 content）
          INSERT INTO notes_new (id, title, file_path, folder_id, excerpt, is_pinned, is_archived, is_favorite, word_count, created_at, updated_at, accessed_at)
          SELECT id, title, file_path, folder_id, excerpt, is_pinned, is_archived, is_favorite, word_count, created_at, updated_at, accessed_at
          FROM notes;

          -- 删除旧表
          DROP TABLE notes;

          -- 重命名新表
          ALTER TABLE notes_new RENAME TO notes;

          -- 重建索引
          CREATE INDEX IF NOT EXISTS idx_notes_folder_id ON notes(folder_id);
          CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at DESC);
          CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON notes(updated_at DESC);
          CREATE INDEX IF NOT EXISTS idx_notes_is_pinned ON notes(is_pinned);
          CREATE INDEX IF NOT EXISTS idx_notes_is_archived ON notes(is_archived);

          -- 删除旧的 FTS 表和触发器
          DROP TRIGGER IF EXISTS notes_fts_insert;
          DROP TRIGGER IF EXISTS notes_fts_update;
          DROP TRIGGER IF EXISTS notes_fts_delete;
          DROP TABLE IF EXISTS notes_fts;

          -- 重建 FTS 表（只索引标题和摘要，不索引内容）
          CREATE VIRTUAL TABLE notes_fts USING fts5(
            title,
            excerpt,
            content='notes',
            content_rowid='rowid'
          );

          -- 新触发器：插入笔记时同步到 FTS
          CREATE TRIGGER notes_fts_insert AFTER INSERT ON notes BEGIN
            INSERT INTO notes_fts(rowid, title, excerpt)
            VALUES (NEW.rowid, NEW.title, NEW.excerpt);
          END;

          -- 新触发器：更新笔记时同步到 FTS
          CREATE TRIGGER notes_fts_update AFTER UPDATE ON notes BEGIN
            UPDATE notes_fts SET title = NEW.title, excerpt = NEW.excerpt
            WHERE rowid = NEW.rowid;
          END;

          -- 新触发器：删除笔记时同步到 FTS
          CREATE TRIGGER notes_fts_delete AFTER DELETE ON notes BEGIN
            DELETE FROM notes_fts WHERE rowid = OLD.rowid;
          END;
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

