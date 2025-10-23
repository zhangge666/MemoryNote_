/**
 * 笔记相关类型定义
 */

export interface Note {
  id: string;
  title: string;
  filePath: string;
  folderId?: string;
  content?: string;
  excerpt?: string;
  isPinned: boolean;
  isArchived: boolean;
  isFavorite: boolean;
  wordCount: number;
  tags?: Tag[];
  createdAt: number;
  updatedAt: number;
  accessedAt?: number;
}

export interface Folder {
  id: string;
  name: string;
  parentId?: string;
  path: string;
  icon?: string;
  color?: string;
  children?: Folder[];
  notes?: Note[];
  createdAt: number;
  updatedAt: number;
}

export interface Tag {
  id: string;
  name: string;
  color?: string;
  createdAt: number;
}

export interface NoteFilter {
  folderId?: string;
  tagIds?: string[];
  isPinned?: boolean;
  isArchived?: boolean;
  isFavorite?: boolean;
  searchQuery?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'title' | 'accessedAt';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface CreateNoteOptions {
  title: string;
  folderId?: string;
  content?: string;
  tags?: string[];
}

export interface UpdateNoteOptions {
  id: string;
  title?: string;
  content?: string;
  folderId?: string;
  isPinned?: boolean;
  isArchived?: boolean;
  isFavorite?: boolean;
  tags?: string[];
}

export interface CreateFolderOptions {
  name: string;
  parentId?: string;
  icon?: string;
  color?: string;
}

export interface FileTreeNode {
  id: string;
  type: 'folder' | 'note';
  name: string;
  path: string;
  children?: FileTreeNode[];
  isExpanded?: boolean;
  isEditing?: boolean;
  icon?: string;
  color?: string;
}

export interface NoteStats {
  totalNotes: number;
  totalFolders: number;
  totalTags: number;
  totalWords: number;
  pinnedNotes: number;
  archivedNotes: number;
}


