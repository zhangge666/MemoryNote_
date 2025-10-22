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

-- 笔记表
CREATE TABLE IF NOT EXISTS notes (
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

-- 标签表
CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color TEXT,
  created_at INTEGER NOT NULL
);

-- 笔记-标签关联表
CREATE TABLE IF NOT EXISTS note_tags (
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


