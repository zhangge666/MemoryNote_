/**
 * 编辑器服务
 * 封装 Milkdown 编辑器的核心功能
 */

import type { Editor } from '@milkdown/core';
import type { EditorOptions, EditorState, EditorPlugin, EditorSelection, FindOptions } from '@shared/types/editor';

export interface IEditorService {
  // 内容操作
  getContent(): string;
  setContent(content: string): void;
  insertText(text: string): void;
  replaceSelection(text: string): void;
  
  // 选区操作
  getSelection(): EditorSelection;
  setSelection(from: number, to: number): void;
  getSelectedText(): string;
  
  // 光标操作
  getCursorPosition(): number;
  setCursorPosition(position: number): void;
  
  // 模式切换
  setMode(mode: 'instant' | 'readonly'): void;
  getMode(): 'instant' | 'readonly';
  
  // 查找替换
  find(query: string, options?: FindOptions): void;
  replace(query: string, replacement: string): void;
  replaceAll(query: string, replacement: string): void;
  
  // 编辑器状态
  getState(): EditorState;
  setState(state: EditorState): void;
  
  // 撤销重做
  undo(): void;
  redo(): void;
  canUndo(): boolean;
  canRedo(): boolean;
  
  // 插件
  use(plugin: EditorPlugin): void;
  
  // 事件
  onChange(callback: (content: string) => void): void;
  onSelectionChange(callback: (selection: { from: number; to: number }) => void): void;
  
  // 销毁
  destroy(): void;
}

export class EditorService implements IEditorService {
  private editor: Editor | null = null;
  private options: EditorOptions;
  private mode: 'instant' | 'readonly' = 'instant';
  private changeCallbacks: Array<(content: string) => void> = [];
  private selectionCallbacks: Array<(selection: { from: number; to: number }) => void> = [];
  
  constructor(options?: Partial<EditorOptions>) {
    this.options = {
      mode: 'instant',
      theme: 'light',
      fontSize: 16,
      lineHeight: 1.6,
      tabSize: 2,
      enableCodeHighlight: true,
      enableMath: true,
      enableMermaid: true,
      enableTableOfContents: true,
      autoSave: true,
      autoSaveDelay: 1000,
      ...options,
    };
    this.mode = this.options.mode;
  }

  setEditor(editor: Editor) {
    this.editor = editor;
  }

  getContent(): string {
    if (!this.editor) return '';
    try {
      return this.editor.action((ctx) => {
        const editorView = ctx.get('editorViewCtx' as any);
        return editorView.state.doc.textContent;
      });
    } catch (error) {
      console.error('Failed to get content:', error);
      return '';
    }
  }

  setContent(content: string): void {
    if (!this.editor) return;
    try {
      this.editor.action((ctx) => {
        const editorView = ctx.get('editorViewCtx' as any);
        const { state } = editorView;
        const tr = state.tr.replaceWith(0, state.doc.content.size, state.schema.text(content));
        editorView.dispatch(tr);
      });
    } catch (error) {
      console.error('Failed to set content:', error);
    }
  }

  insertText(text: string): void {
    if (!this.editor) return;
    try {
      this.editor.action((ctx) => {
        const editorView = ctx.get('editorViewCtx' as any);
        const { state } = editorView;
        const tr = state.tr.insertText(text, state.selection.from);
        editorView.dispatch(tr);
      });
    } catch (error) {
      console.error('Failed to insert text:', error);
    }
  }

  replaceSelection(text: string): void {
    if (!this.editor) return;
    try {
      this.editor.action((ctx) => {
        const editorView = ctx.get('editorViewCtx' as any);
        const { state } = editorView;
        const { from, to } = state.selection;
        const tr = state.tr.replaceWith(from, to, state.schema.text(text));
        editorView.dispatch(tr);
      });
    } catch (error) {
      console.error('Failed to replace selection:', error);
    }
  }

  getSelection(): EditorSelection {
    if (!this.editor) return { from: 0, to: 0, text: '' };
    try {
      return this.editor.action((ctx) => {
        const editorView = ctx.get('editorViewCtx' as any);
        const { state } = editorView;
        const { from, to } = state.selection;
        const text = state.doc.textBetween(from, to);
        return { from, to, text };
      });
    } catch (error) {
      console.error('Failed to get selection:', error);
      return { from: 0, to: 0, text: '' };
    }
  }

  setSelection(from: number, to: number): void {
    if (!this.editor) return;
    try {
      this.editor.action((ctx) => {
        const editorView = ctx.get('editorViewCtx' as any);
        const { state } = editorView;
        const tr = state.tr.setSelection(state.schema.selection.createAt(state.doc, from, to));
        editorView.dispatch(tr);
      });
    } catch (error) {
      console.error('Failed to set selection:', error);
    }
  }

  getSelectedText(): string {
    return this.getSelection().text;
  }

  getCursorPosition(): number {
    if (!this.editor) return 0;
    try {
      return this.editor.action((ctx) => {
        const editorView = ctx.get('editorViewCtx' as any);
        return editorView.state.selection.from;
      });
    } catch (error) {
      console.error('Failed to get cursor position:', error);
      return 0;
    }
  }

  setCursorPosition(position: number): void {
    this.setSelection(position, position);
  }

  setMode(mode: 'instant' | 'readonly'): void {
    this.mode = mode;
    if (!this.editor) return;
    try {
      this.editor.action((ctx) => {
        const editorView = ctx.get('editorViewCtx' as any);
        editorView.setProps({
          editable: () => mode === 'instant',
        });
      });
    } catch (error) {
      console.error('Failed to set mode:', error);
    }
  }

  getMode(): 'instant' | 'readonly' {
    return this.mode;
  }

  find(query: string, options?: FindOptions): void {
    // TODO: 实现查找功能
    console.log('Find:', query, options);
  }

  replace(query: string, replacement: string): void {
    // TODO: 实现替换功能
    console.log('Replace:', query, replacement);
  }

  replaceAll(query: string, replacement: string): void {
    // TODO: 实现全部替换功能
    console.log('Replace all:', query, replacement);
  }

  getState(): EditorState {
    return {
      content: this.getContent(),
      selection: {
        from: this.getSelection().from,
        to: this.getSelection().to,
      },
      scrollTop: 0, // TODO: 获取实际的滚动位置
    };
  }

  setState(state: EditorState): void {
    this.setContent(state.content);
    this.setSelection(state.selection.from, state.selection.to);
    // TODO: 设置滚动位置
  }

  undo(): void {
    if (!this.editor) return;
    try {
      this.editor.action((ctx) => {
        const editorView = ctx.get('editorViewCtx' as any);
        const { state } = editorView;
        const { history } = state;
        if (history && history.undo) {
          history.undo(state, editorView.dispatch);
        }
      });
    } catch (error) {
      console.error('Failed to undo:', error);
    }
  }

  redo(): void {
    if (!this.editor) return;
    try {
      this.editor.action((ctx) => {
        const editorView = ctx.get('editorViewCtx' as any);
        const { state } = editorView;
        const { history } = state;
        if (history && history.redo) {
          history.redo(state, editorView.dispatch);
        }
      });
    } catch (error) {
      console.error('Failed to redo:', error);
    }
  }

  canUndo(): boolean {
    // TODO: 检查是否可以撤销
    return true;
  }

  canRedo(): boolean {
    // TODO: 检查是否可以重做
    return true;
  }

  use(plugin: EditorPlugin): void {
    if (!this.editor) return;
    plugin.setup(this.editor);
  }

  onChange(callback: (content: string) => void): void {
    this.changeCallbacks.push(callback);
  }

  onSelectionChange(callback: (selection: { from: number; to: number }) => void): void {
    this.selectionCallbacks.push(callback);
  }

  triggerChange(content: string): void {
    this.changeCallbacks.forEach(callback => callback(content));
  }

  triggerSelectionChange(selection: { from: number; to: number }): void {
    this.selectionCallbacks.forEach(callback => callback(selection));
  }

  destroy(): void {
    if (this.editor) {
      this.editor.destroy();
      this.editor = null;
    }
    this.changeCallbacks = [];
    this.selectionCallbacks = [];
  }
}

// 单例
let editorService: EditorService | null = null;

export function getEditorService(options?: Partial<EditorOptions>): EditorService {
  if (!editorService) {
    editorService = new EditorService(options);
  }
  return editorService;
}

export function createEditorService(options?: Partial<EditorOptions>): EditorService {
  return new EditorService(options);
}


