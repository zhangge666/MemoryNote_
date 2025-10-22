/**
 * 编辑器相关类型定义
 */

export interface EditorOptions {
  mode: 'instant' | 'readonly' | 'wysiwyg';
  theme: 'light' | 'dark';
  fontSize: number;
  lineHeight: number;
  tabSize: number;
  enableCodeHighlight: boolean;
  enableMath: boolean;
  enableMermaid: boolean;
  enableTableOfContents: boolean;
  autoSave: boolean;
  autoSaveDelay: number;
}

export interface EditorState {
  content: string;
  selection: { from: number; to: number };
  scrollTop: number;
}

export interface EditorPlugin {
  name: string;
  setup: (editor: any) => void;
  destroy?: () => void;
}

export interface EditorSelection {
  from: number;
  to: number;
  text: string;
}

export interface FindOptions {
  caseSensitive?: boolean;
  regex?: boolean;
  wholeWord?: boolean;
}

export interface EditorCommand {
  name: string;
  execute: () => void;
  canExecute?: () => boolean;
  icon?: string;
  shortcut?: string;
}


