/**
 * 数据库操作 IPC 处理器
 * 阶段 2: 文件系统与数据库
 */

import { ipcMain } from 'electron';
import { getInstance as getDatabaseManager } from '../database/DatabaseManager';
import { IPCChannel } from '@shared/interfaces/ipc';

/**
 * 注册数据库操作相关的 IPC 处理器
 */
export function registerDatabaseHandlers(): void {
  const db = getDatabaseManager();

  // 执行查询（返回多行）
  ipcMain.handle(IPCChannel.DB_QUERY, async (_event, sql: string, params?: any[]) => {
    try {
      const result = await db.query(sql, params);
      return { success: true, data: result };
    } catch (error: any) {
      console.error('DB_QUERY error:', error);
      return { success: false, error: error.message };
    }
  });

  // 执行查询（返回单行）
  ipcMain.handle(IPCChannel.DB_QUERY_ONE, async (_event, sql: string, params?: any[]) => {
    try {
      const result = await db.queryOne(sql, params);
      return { success: true, data: result };
    } catch (error: any) {
      console.error('DB_QUERY_ONE error:', error);
      return { success: false, error: error.message };
    }
  });

  // 执行更新/插入/删除
  ipcMain.handle(IPCChannel.DB_EXECUTE, async (_event, sql: string, params?: any[]) => {
    try {
      const result = await db.execute(sql, params);
      return { success: true, data: result };
    } catch (error: any) {
      console.error('DB_EXECUTE error:', error);
      return { success: false, error: error.message };
    }
  });

  // 批量执行
  ipcMain.handle(IPCChannel.DB_EXECUTE_BATCH, async (_event, statements: Array<{ sql: string; params?: any[] }>) => {
    try {
      await db.executeBatch(statements);
      return { success: true };
    } catch (error: any) {
      console.error('DB_EXECUTE_BATCH error:', error);
      return { success: false, error: error.message };
    }
  });

  console.log('✅ Database IPC handlers registered');
}


