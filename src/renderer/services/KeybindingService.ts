/**
 * 快捷键绑定服务
 * 负责快捷键的注册、管理和触发
 */

import { Keybinding } from '@shared/types/command';
import { getCommandService } from './CommandService';

export interface IKeybindingService {
  /** 注册快捷键 */
  registerKeybinding(keybinding: Keybinding): void;

  /** 取消注册快捷键 */
  unregisterKeybinding(key: string): void;

  /** 获取所有快捷键 */
  getAllKeybindings(): Keybinding[];

  /** 获取命令的快捷键 */
  getKeybindingForCommand(commandId: string): string | undefined;

  /** 检测按键冲突 */
  hasConflict(key: string): boolean;

  /** 启动快捷键监听 */
  start(): void;

  /** 停止快捷键监听 */
  stop(): void;

  /** 处理按键事件 */
  handleKeyEvent(event: KeyboardEvent): boolean;
}

export class KeybindingService implements IKeybindingService {
  private keybindings: Map<string, Keybinding> = new Map();
  private listening: boolean = false;
  private boundHandler: ((event: KeyboardEvent) => void) | null = null;

  /**
   * 注册快捷键
   */
  registerKeybinding(keybinding: Keybinding): void {
    const normalizedKey = this.normalizeKey(keybinding.key);
    if (this.keybindings.has(normalizedKey)) {
      // Keybinding already registered, overwriting
    }
    this.keybindings.set(normalizedKey, { ...keybinding, key: normalizedKey });
  }

  /**
   * 取消注册快捷键
   */
  unregisterKeybinding(key: string): void {
    const normalizedKey = this.normalizeKey(key);
    this.keybindings.delete(normalizedKey);
  }

  /**
   * 获取所有快捷键
   */
  getAllKeybindings(): Keybinding[] {
    return Array.from(this.keybindings.values());
  }

  /**
   * 获取命令的快捷键
   */
  getKeybindingForCommand(commandId: string): string | undefined {
    for (const [key, binding] of this.keybindings) {
      if (binding.command === commandId) {
        return key;
      }
    }
    return undefined;
  }

  /**
   * 检测按键冲突
   */
  hasConflict(key: string): boolean {
    const normalizedKey = this.normalizeKey(key);
    return this.keybindings.has(normalizedKey);
  }

  /**
   * 启动快捷键监听
   */
  start(): void {
    if (this.listening) return;

    this.boundHandler = this.handleKeyEvent.bind(this);
    window.addEventListener('keydown', this.boundHandler, true);
    this.listening = true;
  }

  /**
   * 停止快捷键监听
   */
  stop(): void {
    if (!this.listening || !this.boundHandler) return;

    window.removeEventListener('keydown', this.boundHandler, true);
    this.boundHandler = null;
    this.listening = false;
  }

  /**
   * 处理按键事件
   */
  handleKeyEvent(event: KeyboardEvent): boolean {
    // 忽略在输入框中的快捷键（除非是特殊快捷键）
    const target = event.target as HTMLElement;
    const isInputElement =
      target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

    const keyString = this.getKeyString(event);
    const binding = this.keybindings.get(keyString);

    if (!binding) return false;

    // 如果是输入元素，只允许某些特殊快捷键
    if (isInputElement && !this.isSpecialKeybinding(keyString)) {
      return false;
    }

    // 检查上下文条件
    const commandService = getCommandService();
    if (binding.when) {
      const command = commandService.getCommand(binding.command);
      if (command && command.when && !commandService.canExecute(binding.command)) {
        return false;
      }
    }

    // 阻止默认行为
    event.preventDefault();
    event.stopPropagation();

    // 执行命令
    commandService.executeCommand(binding.command).catch(() => {
      // Command execution failed
    });

    return true;
  }

  /**
   * 将按键事件转换为按键字符串
   */
  private getKeyString(event: KeyboardEvent): string {
    const parts: string[] = [];

    if (event.ctrlKey || event.metaKey) {
      parts.push(this.isMac() ? 'Cmd' : 'Ctrl');
    }
    if (event.altKey) {
      parts.push('Alt');
    }
    if (event.shiftKey) {
      parts.push('Shift');
    }

    // 添加主键
    let key = event.key;

    // 特殊键处理
    const keyMap: Record<string, string> = {
      ' ': 'Space',
      ArrowUp: 'Up',
      ArrowDown: 'Down',
      ArrowLeft: 'Left',
      ArrowRight: 'Right',
      Escape: 'Esc',
    };

    key = keyMap[key] || key;

    // 如果不是修饰键本身，添加到parts
    if (!['Control', 'Alt', 'Shift', 'Meta'].includes(key)) {
      parts.push(key.length === 1 ? key.toUpperCase() : key);
    }

    return parts.join('+');
  }

  /**
   * 标准化快捷键字符串
   */
  private normalizeKey(key: string): string {
    const parts = key.split('+').map((part) => part.trim());
    const normalized: string[] = [];

    // 确保顺序一致: Ctrl/Cmd -> Alt -> Shift -> Key
    if (parts.includes('Ctrl') || parts.includes('Cmd')) {
      normalized.push(this.isMac() ? 'Cmd' : 'Ctrl');
    }
    if (parts.includes('Alt')) {
      normalized.push('Alt');
    }
    if (parts.includes('Shift')) {
      normalized.push('Shift');
    }

    // 添加主键（最后一个非修饰键部分）
    const mainKey = parts.find((p) => !['Ctrl', 'Cmd', 'Alt', 'Shift'].includes(p));
    if (mainKey) {
      normalized.push(mainKey.length === 1 ? mainKey.toUpperCase() : mainKey);
    }

    return normalized.join('+');
  }

  /**
   * 判断是否为 Mac
   */
  private isMac(): boolean {
    return navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  }

  /**
   * 判断是否为特殊快捷键（在输入框中也应该生效）
   */
  private isSpecialKeybinding(key: string): boolean {
    const specialKeys = [
      'Ctrl+S',
      'Cmd+S',
      'Ctrl+P',
      'Cmd+P',
      'Ctrl+Shift+P',
      'Cmd+Shift+P',
      'Ctrl+Z',
      'Cmd+Z',
      'Ctrl+Y',
      'Cmd+Y',
      'Ctrl+F',
      'Cmd+F',
      'Esc',
    ];
    return specialKeys.includes(key);
  }
}

// 单例实例
let instance: KeybindingService | null = null;

export const getKeybindingService = (): KeybindingService => {
  if (!instance) {
    instance = new KeybindingService();
  }
  return instance;
};

