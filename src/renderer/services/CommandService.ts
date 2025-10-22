/**
 * 命令服务
 * 负责命令的注册、管理和执行
 */

import { Command, CommandContext } from '@shared/types/command';

export interface ICommandService {
  /** 注册命令 */
  registerCommand(command: Command): void;

  /** 取消注册命令 */
  unregisterCommand(commandId: string): void;

  /** 执行命令 */
  executeCommand(commandId: string, ...args: any[]): Promise<void>;

  /** 获取所有命令 */
  getAllCommands(): Command[];

  /** 获取命令 */
  getCommand(commandId: string): Command | undefined;

  /** 根据分类获取命令 */
  getCommandsByCategory(category: string): Command[];

  /** 搜索命令 */
  searchCommands(query: string): Command[];

  /** 设置上下文 */
  setContext(key: string, value: any): void;

  /** 获取上下文 */
  getContext(): CommandContext;

  /** 清除上下文 */
  clearContext(): void;

  /** 检查命令是否可用 */
  canExecute(commandId: string): boolean;
}

export class CommandService implements ICommandService {
  private commands: Map<string, Command> = new Map();
  private context: CommandContext = {};

  /**
   * 注册命令
   */
  registerCommand(command: Command): void {
    if (this.commands.has(command.id)) {
      // Command already registered, overwriting
    }
    this.commands.set(command.id, command);
  }

  /**
   * 取消注册命令
   */
  unregisterCommand(commandId: string): void {
    this.commands.delete(commandId);
  }

  /**
   * 执行命令
   */
  async executeCommand(commandId: string, ...args: any[]): Promise<void> {
    const command = this.commands.get(commandId);
    if (!command) {
      throw new Error(`Command not found: ${commandId}`);
    }

    // 检查上下文条件
    if (command.when && !this.evaluateWhen(command.when)) {
      return;
    }

    try {
      await command.handler(...args);
    } catch (error) {
      throw error;
    }
  }

  /**
   * 获取所有命令
   */
  getAllCommands(): Command[] {
    return Array.from(this.commands.values());
  }

  /**
   * 获取命令
   */
  getCommand(commandId: string): Command | undefined {
    return this.commands.get(commandId);
  }

  /**
   * 根据分类获取命令
   */
  getCommandsByCategory(category: string): Command[] {
    return this.getAllCommands().filter((cmd) => cmd.category === category);
  }

  /**
   * 搜索命令
   */
  searchCommands(query: string): Command[] {
    const lowerQuery = query.toLowerCase();
    return this.getAllCommands().filter(
      (cmd) =>
        cmd.title.toLowerCase().includes(lowerQuery) ||
        cmd.description?.toLowerCase().includes(lowerQuery) ||
        cmd.id.toLowerCase().includes(lowerQuery),
    );
  }

  /**
   * 设置上下文
   */
  setContext(key: string, value: any): void {
    this.context[key] = value;
  }

  /**
   * 获取上下文
   */
  getContext(): CommandContext {
    return { ...this.context };
  }

  /**
   * 清除上下文
   */
  clearContext(): void {
    this.context = {};
  }

  /**
   * 检查命令是否可用
   */
  canExecute(commandId: string): boolean {
    const command = this.commands.get(commandId);
    if (!command) return false;
    if (!command.when) return true;
    return this.evaluateWhen(command.when);
  }

  /**
   * 评估 when 表达式
   * 简单实现，支持基本的变量检查
   */
  private evaluateWhen(whenExpression: string): boolean {
    try {
      // 简单的表达式评估
      // 支持: editorFocus, activeNote, selectedText
      // 例如: "editorFocus && selectedText"
      const expr = whenExpression.replace(/(\w+)/g, (match) => {
        const value = this.context[match];
        return value !== undefined && value !== null && value !== '' ? 'true' : 'false';
      });

      // eslint-disable-next-line no-eval
      return eval(expr);
    } catch (error) {
      return false;
    }
  }
}

// 单例实例
let instance: CommandService | null = null;

export const getCommandService = (): CommandService => {
  if (!instance) {
    instance = new CommandService();
  }
  return instance;
};


