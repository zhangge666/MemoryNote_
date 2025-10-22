# 记忆笔记 (MemoryNote) - 开发文档

## 1. 项目概述

### 1.1 项目简介
记忆笔记是一款基于 Electron 的个人知识库管理软件，集成了笔记编辑、复习系统、智能检索、插件扩展等功能。

### 1.2 核心功能
1. **Markdown 编辑器**：即时渲染模式 + 阅读模式
2. **插件系统**：可扩展的架构设计
3. **复习系统**：基于 diff 算法的智能复习
4. **NLP & LLM 系统**：智能语义检索与问答
5. **UI 主题系统**：可自定义的界面主题
6. **标签页系统**：支持分屏和嵌套布局
7. **命令与快捷键系统**：全局命令调度

### 1.3 技术栈
- **框架**: Electron + Electron Forge
- **前端**: Vue 3 + TypeScript + Vite
- **状态管理**: Pinia
- **样式**: TailwindCSS
- **数据库**: SQLite3
- **国际化**: Vue I18n
- **编辑器**: 基于 ProseMirror/Milkdown 或自研
- **构建工具**: Vite

### 1.4 项目结构
```
MemoryNote/
├── src/
│   ├── main/                 # 主进程
│   │   ├── index.ts         # 主进程入口
│   │   ├── window/          # 窗口管理
│   │   ├── ipc/             # IPC 通信
│   │   ├── database/        # 数据库管理
│   │   ├── plugins/         # 插件加载器
│   │   └── services/        # 主进程服务
│   ├── preload/             # 预加载脚本
│   │   └── index.ts
│   ├── renderer/            # 渲染进程
│   │   ├── main.ts          # 渲染进程入口
│   │   ├── App.vue          # 根组件
│   │   ├── views/           # 页面组件
│   │   ├── components/      # 通用组件
│   │   ├── stores/          # Pinia 状态管理
│   │   ├── composables/     # 组合式函数
│   │   ├── plugins/         # Vue 插件
│   │   ├── locales/         # 国际化文件
│   │   ├── themes/          # 主题文件
│   │   └── utils/           # 工具函数
│   ├── shared/              # 共享代码
│   │   ├── types/           # 类型定义
│   │   ├── constants/       # 常量定义
│   │   └── interfaces/      # 接口定义
│   └── plugins-api/         # 插件 API
├── workspace/               # 默认工作目录
│   └── .plugins/            # 插件目录
├── dev/                     # 开发文档
├── tests/                   # 测试文件
└── resources/               # 资源文件
```

---

## 2. 软件架构设计

### 2.1 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                        渲染进程 (Renderer)                    │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  UI层    │  │ 编辑器层 │  │ 插件层   │  │  状态层  │   │
│  │  (Vue)   │  │ (Editor) │  │(Plugins) │  │ (Pinia)  │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
│       │             │              │             │          │
│  ┌────┴─────────────┴──────────────┴─────────────┴─────┐   │
│  │              服务层 (Services)                       │   │
│  │  - EditorService  - PluginService                   │   │
│  │  - ReviewService  - ThemeService                    │   │
│  │  - CommandService - SearchService                   │   │
│  └──────────────────────┬───────────────────────────────┘   │
└─────────────────────────┼───────────────────────────────────┘
                          │ IPC Bridge
┌─────────────────────────┼───────────────────────────────────┐
│                    主进程 (Main)                              │
├─────────────────────────┴───────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  窗口管理    │  │  数据库管理  │  │  插件管理    │     │
│  │ WindowMgr    │  │  DatabaseMgr │  │ PluginLoader │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  文件系统    │  │  配置管理    │  │  IPC处理     │     │
│  │ FileSystem   │  │  ConfigMgr   │  │  IPCHandler  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                          │
                  ┌───────┴────────┐
                  │                │
            ┌─────┴─────┐    ┌─────┴─────┐
            │  SQLite   │    │   File    │
            │  Database │    │  System   │
            └───────────┘    └───────────┘
```

### 2.2 模块划分

#### 2.2.1 核心模块
- **窗口管理模块** (Window Manager): 管理应用窗口生命周期
- **IPC 通信模块** (IPC Bridge): 主进程与渲染进程通信
- **数据库模块** (Database): SQLite 数据管理
- **文件系统模块** (File System): 文件读写操作
- **配置管理模块** (Config Manager): 应用配置管理

#### 2.2.2 功能模块
- **编辑器模块** (Editor): Markdown 编辑与渲染
- **复习系统模块** (Review System): 复习卡片管理
- **插件系统模块** (Plugin System): 插件加载与管理
- **搜索模块** (Search): 全文检索与语义搜索
- **主题模块** (Theme System): UI 主题管理
- **标签页模块** (Tab System): 标签页与分屏管理
- **命令系统模块** (Command System): 命令注册与调度
- **通知系统模块** (Notification): 消息通知

#### 2.2.3 UI 模块
- **导航栏** (Navigation Bar): 左侧功能导航
- **工具栏** (Toolbar): 顶部工具栏
- **状态栏** (Status Bar): 底部状态信息
- **侧边栏** (Sidebar): 左右侧边栏
- **工作区** (Workspace): 主编辑区域

---

## 3. 开发阶段规划

### 阶段 0: 项目初始化（1-2天）
**目标**: 完成项目基础架构搭建

**任务清单**:
1. 安装依赖包
2. 配置 TailwindCSS
3. 配置 Vue I18n
4. 创建基础目录结构
5. 配置 ESLint 和 Prettier
6. 编写基础类型定义

**输出物**:
- 完整的项目目录结构
- 基础配置文件
- 类型定义文件

**接口预定义**:
```typescript
// src/shared/types/index.ts - 基础类型定义

// 应用配置
export interface AppConfig {
  workspace: string;
  language: string;
  theme: string;
  pluginDir: string;
}

// 窗口配置
export interface WindowConfig {
  width: number;
  height: number;
  x?: number;
  y?: number;
  maximized: boolean;
}

// 用户配置
export interface UserConfig {
  app: AppConfig;
  window: WindowConfig;
  editor: EditorConfig;
  review: ReviewConfig;
}

// 编辑器配置
export interface EditorConfig {
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  tabSize: number;
  theme: string;
}

// 复习配置
export interface ReviewConfig {
  algorithm: string;
  granularity: 'paragraph' | 'sentence' | 'word';
  syncToCloud: boolean;
}
```

```typescript
// src/shared/interfaces/ipc.ts - IPC 通信接口

export interface IPCResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// 预定义 IPC 频道
export enum IPCChannel {
  // 窗口管理
  WINDOW_MINIMIZE = 'window:minimize',
  WINDOW_MAXIMIZE = 'window:maximize',
  WINDOW_CLOSE = 'window:close',
  
  // 配置管理
  CONFIG_GET = 'config:get',
  CONFIG_SET = 'config:set',
  
  // 文件操作
  FILE_READ = 'file:read',
  FILE_WRITE = 'file:write',
  FILE_DELETE = 'file:delete',
  
  // 数据库操作
  DB_QUERY = 'db:query',
  DB_EXECUTE = 'db:execute',
  
  // 插件系统
  PLUGIN_LOAD = 'plugin:load',
  PLUGIN_UNLOAD = 'plugin:unload',
  PLUGIN_LIST = 'plugin:list',
}
```

---

### 阶段 1: 核心框架搭建（3-5天）
**目标**: 完成基础 UI 框架和窗口管理

**任务清单**:
1. 实现自定义标题栏
2. 实现窗口控制（最小化、最大化、关闭）
3. 实现左右侧边栏伸缩
4. 实现基础布局组件
5. 实现 IPC 通信基础框架
6. 实现配置管理系统
7. 实现国际化基础框架

**依赖**: 阶段 0 的类型定义

**输出物**:
- 完整的应用外壳
- 窗口管理系统
- 配置管理系统
- IPC 通信框架

**接口预定义**:
```typescript
// src/main/window/WindowManager.ts
export interface IWindowManager {
  // 创建主窗口
  createMainWindow(): Promise<BrowserWindow>;
  
  // 窗口控制
  minimize(): void;
  maximize(): void;
  close(): void;
  toggleFullscreen(): void;
  
  // 获取窗口状态
  isMaximized(): boolean;
  isFullscreen(): boolean;
  
  // 窗口事件
  onResize(callback: (width: number, height: number) => void): void;
  onClose(callback: () => void): void;
}

// 提前实现（空实现）
export class WindowManager implements IWindowManager {
  async createMainWindow(): Promise<BrowserWindow> {
    throw new Error('Not implemented');
  }
  minimize(): void {}
  maximize(): void {}
  close(): void {}
  toggleFullscreen(): void {}
  isMaximized(): boolean { return false; }
  isFullscreen(): boolean { return false; }
  onResize(callback: (width: number, height: number) => void): void {}
  onClose(callback: () => void): void {}
}
```

```typescript
// src/main/services/ConfigService.ts
export interface IConfigService {
  // 初始化配置
  initialize(): Promise<void>;
  
  // 获取配置
  get<K extends keyof UserConfig>(key: K): UserConfig[K];
  getAll(): UserConfig;
  
  // 设置配置
  set<K extends keyof UserConfig>(key: K, value: UserConfig[K]): Promise<void>;
  setAll(config: Partial<UserConfig>): Promise<void>;
  
  // 重置配置
  reset(): Promise<void>;
  
  // 监听配置变化
  onChange<K extends keyof UserConfig>(
    key: K, 
    callback: (value: UserConfig[K]) => void
  ): void;
}

// 提前实现（空实现）
export class ConfigService implements IConfigService {
  async initialize(): Promise<void> {}
  get<K extends keyof UserConfig>(key: K): UserConfig[K] {
    throw new Error('Not implemented');
  }
  getAll(): UserConfig {
    throw new Error('Not implemented');
  }
  async set<K extends keyof UserConfig>(key: K, value: UserConfig[K]): Promise<void> {}
  async setAll(config: Partial<UserConfig>): Promise<void> {}
  async reset(): Promise<void> {}
  onChange<K extends keyof UserConfig>(
    key: K, 
    callback: (value: UserConfig[K]) => void
  ): void {}
}
```

```typescript
// src/renderer/composables/useIPC.ts
export interface IIPCBridge {
  // 发送消息到主进程
  invoke<T = any>(channel: string, ...args: any[]): Promise<IPCResponse<T>>;
  
  // 监听主进程消息
  on(channel: string, callback: (...args: any[]) => void): void;
  
  // 移除监听器
  off(channel: string, callback: (...args: any[]) => void): void;
  
  // 发送单向消息
  send(channel: string, ...args: any[]): void;
}

// 提前实现（空实现）
export function useIPC(): IIPCBridge {
  return {
    async invoke<T = any>(channel: string, ...args: any[]): Promise<IPCResponse<T>> {
      throw new Error('Not implemented');
    },
    on(channel: string, callback: (...args: any[]) => void): void {},
    off(channel: string, callback: (...args: any[]) => void): void {},
    send(channel: string, ...args: any[]): void {},
  };
}
```

---

### 阶段 2: 文件系统与数据库（3-4天）
**目标**: 完成文件操作和数据库管理

**任务清单**:
1. 实现文件读写功能
2. 实现文件监控（watch）
3. 实现 SQLite 数据库封装
4. 设计数据库表结构
5. 实现数据库迁移机制
6. 实现工作目录管理

**依赖**: 阶段 1 的 IPC 通信框架

**输出物**:
- 文件系统服务
- 数据库管理系统
- 数据表结构

**数据库设计**:
```sql
-- 笔记表
CREATE TABLE IF NOT EXISTS notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  path TEXT UNIQUE NOT NULL,
  content TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  deleted_at INTEGER,
  metadata TEXT -- JSON 格式
);

-- 复习卡片表
CREATE TABLE IF NOT EXISTS review_cards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  note_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL, -- 'added' | 'modified' | 'deleted'
  difficulty INTEGER DEFAULT 0,
  interval INTEGER DEFAULT 0,
  next_review INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  metadata TEXT, -- JSON 格式
  FOREIGN KEY (note_id) REFERENCES notes(id)
);

-- 复习历史表
CREATE TABLE IF NOT EXISTS review_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  card_id INTEGER NOT NULL,
  quality INTEGER NOT NULL, -- 0-5
  reviewed_at INTEGER NOT NULL,
  time_spent INTEGER, -- 毫秒
  FOREIGN KEY (card_id) REFERENCES review_cards(id)
);

-- 标签表
CREATE TABLE IF NOT EXISTS tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  color TEXT,
  created_at INTEGER NOT NULL
);

-- 笔记标签关联表
CREATE TABLE IF NOT EXISTS note_tags (
  note_id INTEGER NOT NULL,
  tag_id INTEGER NOT NULL,
  PRIMARY KEY (note_id, tag_id),
  FOREIGN KEY (note_id) REFERENCES notes(id),
  FOREIGN KEY (tag_id) REFERENCES tags(id)
);

-- 插件配置表
CREATE TABLE IF NOT EXISTS plugin_configs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  plugin_id TEXT UNIQUE NOT NULL,
  enabled INTEGER DEFAULT 1,
  config TEXT, -- JSON 格式
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
```

**接口预定义**:
```typescript
// src/main/database/DatabaseManager.ts
export interface IDatabaseManager {
  // 初始化数据库
  initialize(): Promise<void>;
  
  // 执行查询
  query<T = any>(sql: string, params?: any[]): Promise<T[]>;
  
  // 执行单条查询
  queryOne<T = any>(sql: string, params?: any[]): Promise<T | null>;
  
  // 执行更新/插入/删除
  execute(sql: string, params?: any[]): Promise<{ changes: number; lastID: number }>;
  
  // 批量执行
  executeBatch(statements: Array<{ sql: string; params?: any[] }>): Promise<void>;
  
  // 事务
  transaction<T>(callback: () => Promise<T>): Promise<T>;
  
  // 关闭数据库
  close(): Promise<void>;
}

// 提前实现（空实现）
export class DatabaseManager implements IDatabaseManager {
  async initialize(): Promise<void> {}
  async query<T = any>(sql: string, params?: any[]): Promise<T[]> {
    return [];
  }
  async queryOne<T = any>(sql: string, params?: any[]): Promise<T | null> {
    return null;
  }
  async execute(sql: string, params?: any[]): Promise<{ changes: number; lastID: number }> {
    return { changes: 0, lastID: 0 };
  }
  async executeBatch(statements: Array<{ sql: string; params?: any[] }>): Promise<void> {}
  async transaction<T>(callback: () => Promise<T>): Promise<T> {
    throw new Error('Not implemented');
  }
  async close(): Promise<void> {}
}
```

```typescript
// src/main/services/FileService.ts
export interface IFileService {
  // 读取文件
  readFile(path: string): Promise<string>;
  readFileBuffer(path: string): Promise<Buffer>;
  
  // 写入文件
  writeFile(path: string, content: string): Promise<void>;
  writeFileBuffer(path: string, buffer: Buffer): Promise<void>;
  
  // 删除文件
  deleteFile(path: string): Promise<void>;
  
  // 文件是否存在
  exists(path: string): Promise<boolean>;
  
  // 文件信息
  stat(path: string): Promise<{ size: number; mtime: Date; isFile: boolean; isDirectory: boolean }>;
  
  // 目录操作
  readDir(path: string): Promise<string[]>;
  createDir(path: string): Promise<void>;
  deleteDir(path: string, recursive?: boolean): Promise<void>;
  
  // 文件监控
  watch(path: string, callback: (event: 'add' | 'change' | 'unlink', filepath: string) => void): void;
  unwatch(path: string): void;
}

// 提前实现（空实现）
export class FileService implements IFileService {
  async readFile(path: string): Promise<string> { return ''; }
  async readFileBuffer(path: string): Promise<Buffer> { return Buffer.from(''); }
  async writeFile(path: string, content: string): Promise<void> {}
  async writeFileBuffer(path: string, buffer: Buffer): Promise<void> {}
  async deleteFile(path: string): Promise<void> {}
  async exists(path: string): Promise<boolean> { return false; }
  async stat(path: string): Promise<any> { 
    return { size: 0, mtime: new Date(), isFile: false, isDirectory: false };
  }
  async readDir(path: string): Promise<string[]> { return []; }
  async createDir(path: string): Promise<void> {}
  async deleteDir(path: string, recursive?: boolean): Promise<void> {}
  watch(path: string, callback: (event: 'add' | 'change' | 'unlink', filepath: string) => void): void {}
  unwatch(path: string): void {}
}
```

---

### 阶段 3: 命令与快捷键系统（2-3天）
**目标**: 实现全局命令注册和快捷键绑定

**任务清单**:
1. 实现命令注册系统
2. 实现快捷键绑定系统
3. 实现命令面板 UI
4. 实现快捷键设置界面
5. 实现命令执行上下文

**依赖**: 阶段 1 的配置管理系统

**输出物**:
- 命令系统服务
- 快捷键管理服务
- 命令面板组件

**接口预定义**:
```typescript
// src/shared/types/command.ts
export interface Command {
  id: string;
  title: string;
  category?: string;
  icon?: string;
  keybinding?: string;
  when?: string; // 上下文条件
  handler: (...args: any[]) => void | Promise<void>;
}

export interface CommandContext {
  activeEditor?: any;
  activeNote?: any;
  selectedText?: string;
  [key: string]: any;
}
```

```typescript
// src/renderer/services/CommandService.ts
export interface ICommandService {
  // 注册命令
  registerCommand(command: Command): void;
  
  // 取消注册命令
  unregisterCommand(commandId: string): void;
  
  // 执行命令
  executeCommand(commandId: string, ...args: any[]): Promise<void>;
  
  // 获取所有命令
  getAllCommands(): Command[];
  
  // 获取命令
  getCommand(commandId: string): Command | undefined;
  
  // 设置上下文
  setContext(key: string, value: any): void;
  getContext(): CommandContext;
}

// 提前实现（空实现）
export class CommandService implements ICommandService {
  registerCommand(command: Command): void {}
  unregisterCommand(commandId: string): void {}
  async executeCommand(commandId: string, ...args: any[]): Promise<void> {}
  getAllCommands(): Command[] { return []; }
  getCommand(commandId: string): Command | undefined { return undefined; }
  setContext(key: string, value: any): void {}
  getContext(): CommandContext { return {}; }
}
```

```typescript
// src/renderer/services/KeybindingService.ts
export interface Keybinding {
  key: string; // e.g., "Ctrl+S", "Cmd+Shift+P"
  command: string;
  when?: string;
}

export interface IKeybindingService {
  // 注册快捷键
  registerKeybinding(keybinding: Keybinding): void;
  
  // 取消注册快捷键
  unregisterKeybinding(key: string): void;
  
  // 获取所有快捷键
  getAllKeybindings(): Keybinding[];
  
  // 获取命令的快捷键
  getKeybindingForCommand(commandId: string): string | undefined;
  
  // 检测按键冲突
  hasConflict(key: string): boolean;
}

// 提前实现（空实现）
export class KeybindingService implements IKeybindingService {
  registerKeybinding(keybinding: Keybinding): void {}
  unregisterKeybinding(key: string): void {}
  getAllKeybindings(): Keybinding[] { return []; }
  getKeybindingForCommand(commandId: string): string | undefined { return undefined; }
  hasConflict(key: string): boolean { return false; }
}
```

---

### 阶段 4: 通知系统（1-2天）
**目标**: 实现全局消息通知

**任务清单**:
1. 实现通知服务
2. 实现通知 UI 组件
3. 实现通知队列管理
4. 实现不同类型的通知样式

**依赖**: 阶段 1 的基础 UI 框架

**输出物**:
- 通知服务
- 通知组件

**接口预定义**:
```typescript
// src/shared/types/notification.ts
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  message: string;
  duration?: number; // 毫秒，0 表示不自动关闭
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  handler: () => void;
}
```

```typescript
// src/renderer/services/NotificationService.ts
export interface INotificationService {
  // 显示通知
  show(notification: Omit<Notification, 'id'>): string;
  
  // 快捷方法
  info(message: string, title?: string): string;
  success(message: string, title?: string): string;
  warning(message: string, title?: string): string;
  error(message: string, title?: string): string;
  
  // 关闭通知
  close(id: string): void;
  
  // 关闭所有通知
  closeAll(): void;
}

// 提前实现（空实现）
export class NotificationService implements INotificationService {
  show(notification: Omit<Notification, 'id'>): string { return ''; }
  info(message: string, title?: string): string { return ''; }
  success(message: string, title?: string): string { return ''; }
  warning(message: string, title?: string): string { return ''; }
  error(message: string, title?: string): string { return ''; }
  close(id: string): void {}
  closeAll(): void {}
}
```

---

### 阶段 5: 标签页系统（4-5天）
**目标**: 实现标签页管理和分屏功能

**任务清单**:
1. 实现标签页数据模型
2. 实现标签页 UI 组件
3. 实现分屏布局管理
4. 实现嵌套分区
5. 实现标签拖拽排序
6. 实现文件修改状态标记
7. 实现关闭提示保存
8. 实现状态持久化

**依赖**: 
- 阶段 1 的配置管理系统
- 阶段 3 的命令系统

**输出物**:
- 标签页管理服务
- 标签页组件
- 分屏布局组件

**接口预定义**:
```typescript
// src/shared/types/tab.ts
export interface Tab {
  id: string;
  title: string;
  type: 'editor' | 'plugin' | 'settings';
  filePath?: string;
  icon?: string;
  isDirty: boolean; // 是否有未保存的修改
  isPinned: boolean;
  data?: any; // 扩展数据
}

export interface TabGroup {
  id: string;
  tabs: Tab[];
  activeTabId: string | null;
}

export interface SplitLayout {
  type: 'single' | 'horizontal' | 'vertical';
  groups?: string[]; // TabGroup IDs
  children?: SplitLayout[]; // 嵌套布局
  ratio?: number; // 分割比例
}

export interface TabSystemState {
  groups: Map<string, TabGroup>;
  layout: SplitLayout;
  activeGroupId: string | null;
}
```

```typescript
// src/renderer/services/TabService.ts
export interface ITabService {
  // 标签页操作
  openTab(tab: Omit<Tab, 'id' | 'isDirty' | 'isPinned'>, groupId?: string): string;
  closeTab(tabId: string): Promise<boolean>; // 返回是否成功关闭
  closeAllTabs(groupId?: string): Promise<void>;
  closeOtherTabs(tabId: string): Promise<void>;
  
  // 标签页状态
  setTabDirty(tabId: string, isDirty: boolean): void;
  toggleTabPin(tabId: string): void;
  
  // 标签页切换
  activateTab(tabId: string): void;
  getActiveTab(groupId?: string): Tab | null;
  
  // 分组操作
  createGroup(): string;
  deleteGroup(groupId: string): void;
  moveTabToGroup(tabId: string, targetGroupId: string): void;
  
  // 分屏操作
  splitHorizontal(groupId?: string): void;
  splitVertical(groupId?: string): void;
  unsplit(groupId: string): void;
  
  // 状态管理
  getState(): TabSystemState;
  restoreState(state: TabSystemState): void;
  
  // 查找标签
  findTabById(tabId: string): Tab | null;
  findTabByPath(filePath: string): Tab | null;
}

// 提前实现（空实现）
export class TabService implements ITabService {
  openTab(tab: Omit<Tab, 'id' | 'isDirty' | 'isPinned'>, groupId?: string): string { return ''; }
  async closeTab(tabId: string): Promise<boolean> { return true; }
  async closeAllTabs(groupId?: string): Promise<void> {}
  async closeOtherTabs(tabId: string): Promise<void> {}
  setTabDirty(tabId: string, isDirty: boolean): void {}
  toggleTabPin(tabId: string): void {}
  activateTab(tabId: string): void {}
  getActiveTab(groupId?: string): Tab | null { return null; }
  createGroup(): string { return ''; }
  deleteGroup(groupId: string): void {}
  moveTabToGroup(tabId: string, targetGroupId: string): void {}
  splitHorizontal(groupId?: string): void {}
  splitVertical(groupId?: string): void {}
  unsplit(groupId: string): void {}
  getState(): TabSystemState {
    return {
      groups: new Map(),
      layout: { type: 'single' },
      activeGroupId: null,
    };
  }
  restoreState(state: TabSystemState): void {}
  findTabById(tabId: string): Tab | null { return null; }
  findTabByPath(filePath: string): Tab | null { return null; }
}
```

---

### 阶段 6: Markdown 编辑器（7-10天）
**目标**: 实现即时渲染模式的 Markdown 编辑器

**任务清单**:
1. 选择或实现编辑器核心（ProseMirror/Milkdown）
2. 实现即时渲染模式
3. 实现阅读模式
4. 实现基础 Markdown 语法支持
5. 实现代码块高亮
6. 实现数学公式渲染（KaTeX）
7. 实现图片支持
8. 实现图表支持（Mermaid）
9. 实现表格编辑
10. 实现编辑器工具栏
11. 实现编辑器快捷键

**依赖**: 
- 阶段 3 的命令系统
- 阶段 5 的标签页系统

**输出物**:
- 编辑器核心组件
- 编辑器服务
- 编辑器插件 API

**接口预定义**:
```typescript
// src/shared/types/editor.ts
export interface EditorOptions {
  mode: 'instant' | 'readonly';
  theme: string;
  fontSize: number;
  lineHeight: number;
  tabSize: number;
  enableCodeHighlight: boolean;
  enableMath: boolean;
  enableMermaid: boolean;
}

export interface EditorState {
  content: string;
  selection: { from: number; to: number };
  scrollTop: number;
}

export interface EditorPlugin {
  name: string;
  setup: (editor: IEditor) => void;
  destroy?: () => void;
}
```

```typescript
// src/renderer/services/EditorService.ts
export interface IEditor {
  // 内容操作
  getContent(): string;
  setContent(content: string): void;
  insertText(text: string): void;
  replaceSelection(text: string): void;
  
  // 选区操作
  getSelection(): { from: number; to: number; text: string };
  setSelection(from: number, to: number): void;
  getSelectedText(): string;
  
  // 光标操作
  getCursorPosition(): number;
  setCursorPosition(position: number): void;
  
  // 模式切换
  setMode(mode: 'instant' | 'readonly'): void;
  getMode(): 'instant' | 'readonly';
  
  // 查找替换
  find(query: string, options?: { caseSensitive?: boolean; regex?: boolean }): void;
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

// 提前实现（空实现）
export class EditorService implements IEditor {
  getContent(): string { return ''; }
  setContent(content: string): void {}
  insertText(text: string): void {}
  replaceSelection(text: string): void {}
  getSelection(): { from: number; to: number; text: string } {
    return { from: 0, to: 0, text: '' };
  }
  setSelection(from: number, to: number): void {}
  getSelectedText(): string { return ''; }
  getCursorPosition(): number { return 0; }
  setCursorPosition(position: number): void {}
  setMode(mode: 'instant' | 'readonly'): void {}
  getMode(): 'instant' | 'readonly' { return 'instant'; }
  find(query: string, options?: { caseSensitive?: boolean; regex?: boolean }): void {}
  replace(query: string, replacement: string): void {}
  replaceAll(query: string, replacement: string): void {}
  getState(): EditorState {
    return { content: '', selection: { from: 0, to: 0 }, scrollTop: 0 };
  }
  setState(state: EditorState): void {}
  undo(): void {}
  redo(): void {}
  canUndo(): boolean { return false; }
  canRedo(): boolean { return false; }
  use(plugin: EditorPlugin): void {}
  onChange(callback: (content: string) => void): void {}
  onSelectionChange(callback: (selection: { from: number; to: number }) => void): void {}
  destroy(): void {}
}
```

---

### 阶段 7: 笔记管理（3-4天）
**目标**: 实现笔记的创建、读取、更新、删除

**任务清单**:
1. 实现笔记 CRUD 操作
2. 实现笔记列表展示
3. 实现笔记搜索（基础）
4. 实现笔记标签管理
5. 实现笔记元数据管理
6. 集成编辑器与文件系统

**依赖**: 
- 阶段 2 的文件系统和数据库
- 阶段 6 的编辑器

**输出物**:
- 笔记管理服务
- 笔记列表组件
- 笔记详情组件

**接口预定义**:
```typescript
// src/shared/types/note.ts
export interface Note {
  id: number;
  title: string;
  path: string;
  content?: string;
  createdAt: number;
  updatedAt: number;
  deletedAt?: number;
  metadata: NoteMetadata;
}

export interface NoteMetadata {
  tags: string[];
  wordCount: number;
  readingTime: number; // 分钟
  [key: string]: any;
}

export interface NoteQuery {
  keyword?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
  orderBy?: 'title' | 'createdAt' | 'updatedAt';
  order?: 'asc' | 'desc';
}
```

```typescript
// src/main/services/NoteService.ts
export interface INoteService {
  // 创建笔记
  createNote(title: string, path: string, content?: string): Promise<Note>;
  
  // 读取笔记
  getNote(id: number): Promise<Note | null>;
  getNoteByPath(path: string): Promise<Note | null>;
  
  // 更新笔记
  updateNote(id: number, updates: Partial<Note>): Promise<void>;
  updateNoteContent(id: number, content: string): Promise<void>;
  
  // 删除笔记
  deleteNote(id: number, permanent?: boolean): Promise<void>;
  
  // 查询笔记
  queryNotes(query: NoteQuery): Promise<Note[]>;
  getAllNotes(): Promise<Note[]>;
  
  // 标签操作
  addTag(noteId: number, tag: string): Promise<void>;
  removeTag(noteId: number, tag: string): Promise<void>;
  getAllTags(): Promise<string[]>;
  
  // 导入导出
  importNote(filePath: string): Promise<Note>;
  exportNote(noteId: number, targetPath: string): Promise<void>;
}

// 提前实现（空实现）
export class NoteService implements INoteService {
  async createNote(title: string, path: string, content?: string): Promise<Note> {
    throw new Error('Not implemented');
  }
  async getNote(id: number): Promise<Note | null> { return null; }
  async getNoteByPath(path: string): Promise<Note | null> { return null; }
  async updateNote(id: number, updates: Partial<Note>): Promise<void> {}
  async updateNoteContent(id: number, content: string): Promise<void> {}
  async deleteNote(id: number, permanent?: boolean): Promise<void> {}
  async queryNotes(query: NoteQuery): Promise<Note[]> { return []; }
  async getAllNotes(): Promise<Note[]> { return []; }
  async addTag(noteId: number, tag: string): Promise<void> {}
  async removeTag(noteId: number, tag: string): Promise<void> {}
  async getAllTags(): Promise<string[]> { return []; }
  async importNote(filePath: string): Promise<Note> {
    throw new Error('Not implemented');
  }
  async exportNote(noteId: number, targetPath: string): Promise<void> {}
}
```

---

### 阶段 8: 主题系统（2-3天）
**目标**: 实现 UI 主题自定义

**任务清单**:
1. 设计主题数据结构
2. 实现主题加载机制
3. 实现主题切换
4. 创建默认主题（亮色、暗色）
5. 实现第三方主题安装
6. 实现主题选择界面

**依赖**: 阶段 1 的配置管理系统

**输出物**:
- 主题服务
- 默认主题文件
- 主题选择组件

**接口预定义**:
```typescript
// src/shared/types/theme.ts
export interface Theme {
  id: string;
  name: string;
  version: string;
  author: string;
  description?: string;
  colors: ThemeColors;
  fonts?: ThemeFonts;
  custom?: Record<string, any>;
}

export interface ThemeColors {
  // 基础颜色
  primary: string;
  secondary: string;
  accent: string;
  
  // 背景颜色
  background: string;
  backgroundSecondary: string;
  backgroundTertiary: string;
  
  // 文本颜色
  text: string;
  textSecondary: string;
  textMuted: string;
  
  // 边框颜色
  border: string;
  borderActive: string;
  
  // 状态颜色
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // 编辑器颜色
  editorBackground: string;
  editorText: string;
  editorSelection: string;
  editorCursor: string;
  
  // 语法高亮
  syntaxKeyword: string;
  syntaxString: string;
  syntaxComment: string;
  syntaxFunction: string;
  syntaxVariable: string;
  
  [key: string]: string;
}

export interface ThemeFonts {
  body: string;
  heading: string;
  mono: string;
}
```

```typescript
// src/renderer/services/ThemeService.ts
export interface IThemeService {
  // 加载主题
  loadTheme(themeId: string): Promise<void>;
  
  // 获取主题
  getCurrentTheme(): Theme;
  getTheme(themeId: string): Promise<Theme | null>;
  getAllThemes(): Promise<Theme[]>;
  
  // 安装主题
  installTheme(themePath: string): Promise<void>;
  
  // 卸载主题
  uninstallTheme(themeId: string): Promise<void>;
  
  // 应用主题
  applyTheme(theme: Theme): void;
  
  // 监听主题变化
  onThemeChange(callback: (theme: Theme) => void): void;
}

// 提前实现（空实现）
export class ThemeService implements IThemeService {
  async loadTheme(themeId: string): Promise<void> {}
  getCurrentTheme(): Theme {
    throw new Error('Not implemented');
  }
  async getTheme(themeId: string): Promise<Theme | null> { return null; }
  async getAllThemes(): Promise<Theme[]> { return []; }
  async installTheme(themePath: string): Promise<void> {}
  async uninstallTheme(themeId: string): Promise<void> {}
  applyTheme(theme: Theme): void {}
  onThemeChange(callback: (theme: Theme) => void): void {}
}
```

---

### 阶段 9: 复习系统（5-7天）
**目标**: 实现基于 diff 的复习卡片系统

**任务清单**:
1. 实现文件 diff 算法
2. 实现复习卡片生成
3. 实现复习算法（SM-2）
4. 实现复习界面
5. 实现复习统计
6. 实现复习提醒
7. 预留复习算法接口

**依赖**: 
- 阶段 2 的数据库
- 阶段 7 的笔记管理

**输出物**:
- 复习服务
- 复习卡片组件
- 复习统计组件

**接口预定义**:
```typescript
// src/shared/types/review.ts
export interface ReviewCard {
  id: number;
  noteId: number;
  content: string;
  type: 'added' | 'modified' | 'deleted';
  difficulty: number; // 难度系数
  interval: number; // 复习间隔（天）
  nextReview: number; // 下次复习时间戳
  createdAt: number;
  updatedAt: number;
  metadata?: Record<string, any>;
}

export interface ReviewResult {
  quality: number; // 0-5，5 表示完全记住
  timeSpent: number; // 毫秒
}

export interface ReviewStats {
  totalCards: number;
  dueCards: number;
  learnedCards: number;
  reviewedToday: number;
  averageQuality: number;
}

export interface DiffChange {
  type: 'add' | 'modify' | 'delete';
  content: string;
  lineStart: number;
  lineEnd: number;
}
```

```typescript
// src/main/services/ReviewService.ts
export interface IReviewAlgorithm {
  name: string;
  calculate(card: ReviewCard, result: ReviewResult): {
    interval: number;
    difficulty: number;
    nextReview: number;
  };
}

export interface IReviewService {
  // 生成复习卡片
  generateCardsFromDiff(noteId: number, oldContent: string, newContent: string): Promise<ReviewCard[]>;
  
  // 获取复习卡片
  getDueCards(limit?: number): Promise<ReviewCard[]>;
  getCardsByNote(noteId: number): Promise<ReviewCard[]>;
  getCard(cardId: number): Promise<ReviewCard | null>;
  
  // 复习操作
  reviewCard(cardId: number, result: ReviewResult): Promise<void>;
  skipCard(cardId: number): Promise<void>;
  deleteCard(cardId: number): Promise<void>;
  
  // 统计信息
  getStats(): Promise<ReviewStats>;
  
  // 算法管理
  setAlgorithm(algorithm: IReviewAlgorithm): void;
  getAlgorithm(): IReviewAlgorithm;
  
  // Diff 算法（可替换）
  setDiffAlgorithm(algorithm: (oldText: string, newText: string) => DiffChange[]): void;
}

// 提前实现（空实现）
export class ReviewService implements IReviewService {
  async generateCardsFromDiff(noteId: number, oldContent: string, newContent: string): Promise<ReviewCard[]> {
    return [];
  }
  async getDueCards(limit?: number): Promise<ReviewCard[]> { return []; }
  async getCardsByNote(noteId: number): Promise<ReviewCard[]> { return []; }
  async getCard(cardId: number): Promise<ReviewCard | null> { return null; }
  async reviewCard(cardId: number, result: ReviewResult): Promise<void> {}
  async skipCard(cardId: number): Promise<void> {}
  async deleteCard(cardId: number): Promise<void> {}
  async getStats(): Promise<ReviewStats> {
    return {
      totalCards: 0,
      dueCards: 0,
      learnedCards: 0,
      reviewedToday: 0,
      averageQuality: 0,
    };
  }
  setAlgorithm(algorithm: IReviewAlgorithm): void {}
  getAlgorithm(): IReviewAlgorithm {
    throw new Error('Not implemented');
  }
  setDiffAlgorithm(algorithm: (oldText: string, newText: string) => DiffChange[]): void {}
}
```

---

### 阶段 10: 搜索系统（3-4天）
**目标**: 实现全文搜索功能

**任务清单**:
1. 实现基础全文搜索
2. 实现搜索结果高亮
3. 实现搜索历史
4. 实现高级搜索（正则、标签过滤）
5. 实现搜索界面
6. 预留语义搜索接口

**依赖**: 阶段 7 的笔记管理

**输出物**:
- 搜索服务
- 搜索界面组件

**接口预定义**:
```typescript
// src/shared/types/search.ts
export interface SearchOptions {
  keyword: string;
  caseSensitive?: boolean;
  regex?: boolean;
  tags?: string[];
  dateRange?: { from: number; to: number };
  limit?: number;
}

export interface SearchResult {
  note: Note;
  matches: SearchMatch[];
  score: number;
}

export interface SearchMatch {
  content: string;
  lineNumber: number;
  columnStart: number;
  columnEnd: number;
}
```

```typescript
// src/main/services/SearchService.ts
export interface ISearchEngine {
  name: string;
  search(options: SearchOptions): Promise<SearchResult[]>;
}

export interface ISearchService {
  // 搜索
  search(options: SearchOptions): Promise<SearchResult[]>;
  
  // 搜索引擎
  setSearchEngine(engine: ISearchEngine): void;
  getSearchEngine(): ISearchEngine;
  
  // 搜索历史
  getSearchHistory(limit?: number): Promise<string[]>;
  addSearchHistory(keyword: string): Promise<void>;
  clearSearchHistory(): Promise<void>;
  
  // 索引管理（为语义搜索预留）
  buildIndex(): Promise<void>;
  updateIndex(noteId: number): Promise<void>;
}

// 提前实现（空实现）
export class SearchService implements ISearchService {
  async search(options: SearchOptions): Promise<SearchResult[]> { return []; }
  setSearchEngine(engine: ISearchEngine): void {}
  getSearchEngine(): ISearchEngine {
    throw new Error('Not implemented');
  }
  async getSearchHistory(limit?: number): Promise<string[]> { return []; }
  async addSearchHistory(keyword: string): Promise<void> {}
  async clearSearchHistory(): Promise<void> {}
  async buildIndex(): Promise<void> {}
  async updateIndex(noteId: number): Promise<void> {}
}
```

---

### 阶段 11: 插件系统（7-10天）
**目标**: 实现可扩展的插件架构

**任务清单**:
1. 设计插件 API
2. 实现插件加载机制
3. 实现插件沙箱环境
4. 实现插件生命周期管理
5. 实现插件注册点（导航栏、状态栏、侧边栏等）
6. 实现插件配置界面
7. 创建插件开发文档
8. 创建示例插件

**依赖**: 
- 阶段 3 的命令系统
- 阶段 6 的编辑器
- 阶段 9 的复习系统

**输出物**:
- 插件系统核心
- 插件 API
- 插件管理界面
- 插件开发文档

**接口预定义**:
```typescript
// src/plugins-api/types.ts
export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  main: string; // 入口文件
  icon?: string;
  engines: {
    memorynote: string; // 兼容的应用版本
  };
  activationEvents?: string[]; // 激活时机
  contributes?: PluginContributes;
}

export interface PluginContributes {
  commands?: Command[];
  keybindings?: Keybinding[];
  views?: PluginView[];
  themes?: string[];
}

export interface PluginView {
  id: string;
  title: string;
  icon?: string;
  location: 'sidebar-left' | 'sidebar-right' | 'statusbar' | 'navbar';
  component: any;
}

export interface PluginContext {
  extensionPath: string;
  globalState: IPluginStorage;
  workspaceState: IPluginStorage;
}

export interface IPluginStorage {
  get<T>(key: string): T | undefined;
  set(key: string, value: any): Promise<void>;
  delete(key: string): Promise<void>;
}

export interface IPlugin {
  activate(context: PluginContext): void | Promise<void>;
  deactivate?(): void | Promise<void>;
}
```

```typescript
// src/plugins-api/api.ts - 插件 API
export interface PluginAPI {
  // 应用信息
  app: {
    getVersion(): string;
    getWorkspace(): string;
  };
  
  // 窗口操作
  window: {
    showNotification(notification: Omit<Notification, 'id'>): string;
    showInputBox(options: { title: string; placeholder?: string }): Promise<string | undefined>;
    showQuickPick(items: string[], options?: { title?: string }): Promise<string | undefined>;
  };
  
  // 编辑器操作
  editor: {
    getActiveEditor(): IEditor | undefined;
    getContent(): string;
    setContent(content: string): void;
    getSelection(): { from: number; to: number; text: string };
    replaceSelection(text: string): void;
    insertText(text: string): void;
  };
  
  // 笔记操作
  notes: {
    create(title: string, content: string): Promise<Note>;
    get(id: number): Promise<Note | null>;
    update(id: number, updates: Partial<Note>): Promise<void>;
    delete(id: number): Promise<void>;
    query(query: NoteQuery): Promise<Note[]>;
  };
  
  // 复习系统
  review: {
    generateCards(noteId: number, oldContent: string, newContent: string): Promise<ReviewCard[]>;
    getDueCards(): Promise<ReviewCard[]>;
    reviewCard(cardId: number, result: ReviewResult): Promise<void>;
    getStats(): Promise<ReviewStats>;
    
    // 注册自定义算法
    registerAlgorithm(algorithm: IReviewAlgorithm): void;
    registerDiffAlgorithm(algorithm: (oldText: string, newText: string) => DiffChange[]): void;
  };
  
  // 命令系统
  commands: {
    registerCommand(command: Command): void;
    executeCommand(commandId: string, ...args: any[]): Promise<void>;
  };
  
  // UI 扩展
  ui: {
    registerView(view: PluginView): void;
    unregisterView(viewId: string): void;
  };
  
  // 搜索
  search: {
    search(options: SearchOptions): Promise<SearchResult[]>;
    registerSearchEngine(engine: ISearchEngine): void;
  };
  
  // 文件系统
  fs: {
    readFile(path: string): Promise<string>;
    writeFile(path: string, content: string): Promise<void>;
    exists(path: string): Promise<boolean>;
  };
  
  // 数据库（受限访问）
  db: {
    query<T>(sql: string, params?: any[]): Promise<T[]>;
  };
}
```

```typescript
// src/main/plugins/PluginManager.ts
export interface IPluginManager {
  // 加载插件
  loadPlugin(pluginPath: string): Promise<void>;
  loadAllPlugins(): Promise<void>;
  
  // 卸载插件
  unloadPlugin(pluginId: string): Promise<void>;
  
  // 启用/禁用插件
  enablePlugin(pluginId: string): Promise<void>;
  disablePlugin(pluginId: string): Promise<void>;
  
  // 获取插件
  getPlugin(pluginId: string): IPlugin | undefined;
  getAllPlugins(): PluginManifest[];
  getEnabledPlugins(): PluginManifest[];
  
  // 安装/卸载
  installPlugin(pluginPath: string): Promise<void>;
  uninstallPlugin(pluginId: string): Promise<void>;
}

// 提前实现（空实现）
export class PluginManager implements IPluginManager {
  async loadPlugin(pluginPath: string): Promise<void> {}
  async loadAllPlugins(): Promise<void> {}
  async unloadPlugin(pluginId: string): Promise<void> {}
  async enablePlugin(pluginId: string): Promise<void> {}
  async disablePlugin(pluginId: string): Promise<void> {}
  getPlugin(pluginId: string): IPlugin | undefined { return undefined; }
  getAllPlugins(): PluginManifest[] { return []; }
  getEnabledPlugins(): PluginManifest[] { return []; }
  async installPlugin(pluginPath: string): Promise<void> {}
  async uninstallPlugin(pluginId: string): Promise<void> {}
}
```

---

### 阶段 12: NLP 与 LLM 系统（7-10天）
**目标**: 实现智能语义检索与问答

**任务清单**:
1. 集成向量数据库（如 ChromaDB 或自建）
2. 实现文本向量化
3. 实现语义检索
4. 集成 LLM API（OpenAI/本地模型）
5. 实现知识库问答
6. 实现错误检测与修正提醒
7. 实现 AI 助手界面

**依赖**: 
- 阶段 7 的笔记管理
- 阶段 10 的搜索系统

**输出物**:
- NLP 服务
- LLM 服务
- AI 助手组件

**接口预定义**:
```typescript
// src/shared/types/ai.ts
export interface VectorSearchResult {
  note: Note;
  similarity: number;
  excerpt: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface LLMConfig {
  provider: 'openai' | 'anthropic' | 'local';
  apiKey?: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
}
```

```typescript
// src/main/services/NLPService.ts
export interface INLPService {
  // 向量化
  vectorize(text: string): Promise<number[]>;
  
  // 语义检索
  semanticSearch(query: string, limit?: number): Promise<VectorSearchResult[]>;
  
  // 索引管理
  addToIndex(noteId: number, content: string): Promise<void>;
  removeFromIndex(noteId: number): Promise<void>;
  rebuildIndex(): Promise<void>;
}

// 提前实现（空实现）
export class NLPService implements INLPService {
  async vectorize(text: string): Promise<number[]> { return []; }
  async semanticSearch(query: string, limit?: number): Promise<VectorSearchResult[]> { return []; }
  async addToIndex(noteId: number, content: string): Promise<void> {}
  async removeFromIndex(noteId: number): Promise<void> {}
  async rebuildIndex(): Promise<void> {}
}
```

```typescript
// src/main/services/LLMService.ts
export interface ILLMService {
  // 配置
  setConfig(config: LLMConfig): void;
  getConfig(): LLMConfig;
  
  // 对话
  chat(messages: ChatMessage[], context?: string): Promise<string>;
  
  // 知识库问答
  askWithContext(question: string, limit?: number): Promise<{
    answer: string;
    sources: Note[];
  }>;
  
  // 内容检查
  checkContent(content: string, knowledgeBase: string[]): Promise<{
    hasErrors: boolean;
    suggestions: string[];
  }>;
  
  // 流式输出
  chatStream(
    messages: ChatMessage[],
    onChunk: (chunk: string) => void
  ): Promise<void>;
}

// 提前实现（空实现）
export class LLMService implements ILLMService {
  setConfig(config: LLMConfig): void {}
  getConfig(): LLMConfig {
    throw new Error('Not implemented');
  }
  async chat(messages: ChatMessage[], context?: string): Promise<string> { return ''; }
  async askWithContext(question: string, limit?: number): Promise<any> {
    return { answer: '', sources: [] };
  }
  async checkContent(content: string, knowledgeBase: string[]): Promise<any> {
    return { hasErrors: false, suggestions: [] };
  }
  async chatStream(
    messages: ChatMessage[],
    onChunk: (chunk: string) => void
  ): Promise<void> {}
}
```

---

### 阶段 13: 用户系统与云同步（可选，5-7天）
**目标**: 实现用户登录和云端同步

**任务清单**:
1. 设计用户认证流程
2. 实现登录/注册界面
3. 实现 JWT 认证
4. 实现数据同步协议
5. 实现冲突解决
6. 实现云端备份

**依赖**: 阶段 2 的数据库

**输出物**:
- 用户服务
- 同步服务
- 登录界面

**接口预定义**:
```typescript
// src/shared/types/user.ts
export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  createdAt: number;
}

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}
```

```typescript
// src/main/services/AuthService.ts
export interface IAuthService {
  // 登录/注册
  login(email: string, password: string): Promise<{ user: User; token: AuthToken }>;
  register(username: string, email: string, password: string): Promise<{ user: User; token: AuthToken }>;
  logout(): Promise<void>;
  
  // Token 管理
  refreshToken(): Promise<AuthToken>;
  validateToken(): Promise<boolean>;
  
  // 用户信息
  getCurrentUser(): User | null;
  updateUser(updates: Partial<User>): Promise<void>;
}

// 提前实现（空实现）
export class AuthService implements IAuthService {
  async login(email: string, password: string): Promise<any> {
    throw new Error('Not implemented');
  }
  async register(username: string, email: string, password: string): Promise<any> {
    throw new Error('Not implemented');
  }
  async logout(): Promise<void> {}
  async refreshToken(): Promise<AuthToken> {
    throw new Error('Not implemented');
  }
  async validateToken(): Promise<boolean> { return false; }
  getCurrentUser(): User | null { return null; }
  async updateUser(updates: Partial<User>): Promise<void> {}
}
```

```typescript
// src/main/services/SyncService.ts
export interface ISyncService {
  // 同步控制
  startSync(): void;
  stopSync(): void;
  isSyncing(): boolean;
  
  // 手动同步
  syncNow(): Promise<void>;
  
  // 同步状态
  getSyncStatus(): {
    lastSync: number;
    status: 'idle' | 'syncing' | 'error';
    error?: string;
  };
  
  // 冲突解决
  resolveConflict(noteId: number, resolution: 'local' | 'remote'): Promise<void>;
  getPendingConflicts(): Promise<Array<{ noteId: number; localVersion: Note; remoteVersion: Note }>>;
}

// 提前实现（空实现）
export class SyncService implements ISyncService {
  startSync(): void {}
  stopSync(): void {}
  isSyncing(): boolean { return false; }
  async syncNow(): Promise<void> {}
  getSyncStatus(): any {
    return { lastSync: 0, status: 'idle' };
  }
  async resolveConflict(noteId: number, resolution: 'local' | 'remote'): Promise<void> {}
  async getPendingConflicts(): Promise<any[]> { return []; }
}
```

---

### 阶段 14: 测试与优化（持续）
**目标**: 确保软件质量和性能

**任务清单**:
1. 编写单元测试
2. 编写集成测试
3. 性能优化
4. 内存泄漏检测
5. 用户体验优化
6. Bug 修复

**依赖**: 所有阶段

**输出物**:
- 测试用例
- 性能报告
- Bug 修复记录

---

## 4. 开发规范

### 4.1 代码规范
- 使用 ESLint 和 Prettier 保持代码风格一致
- 使用 TypeScript 严格模式
- 所有公共 API 必须有类型定义
- 函数和类必须有 JSDoc 注释

### 4.2 接口规范
- **接口优先**: 在实现功能之前，必须先定义接口
- **接口隔离**: 接口应该小而专一
- **依赖倒置**: 高层模块依赖接口，不依赖具体实现
- **空实现**: 如果接口在当前阶段不实现，必须提供空实现，不能留空

### 4.3 Git 规范
- 使用语义化提交信息（Conventional Commits）
- 每个功能一个分支
- 代码审查后才能合并

### 4.4 文档规范
- 每个模块必须有 README
- API 必须有完整的文档
- 插件开发必须有详细的教程

---

## 5. 技术选型详细说明

### 5.1 编辑器选择
推荐使用 **Milkdown** 或 **ProseMirror**：
- Milkdown: 基于 ProseMirror，提供更好的 Markdown 支持
- ProseMirror: 更底层，可定制性强

### 5.2 数据库选择
使用 **better-sqlite3**：
- 同步 API，性能更好
- 适合 Electron 环境

### 5.3 向量数据库选择（NLP 系统）
推荐：
- **本地**: hnswlib-node（轻量级）
- **云端**: Pinecone 或 Weaviate

### 5.4 LLM 集成
支持多种提供商：
- OpenAI API
- Anthropic Claude
- 本地模型（Ollama）

---

## 6. 部署与打包

### 6.1 打包配置
使用 Electron Forge 配置：
```javascript
// forge.config.ts
{
  makers: [
    {
      name: '@electron-forge/maker-squirrel', // Windows
      config: {}
    },
    {
      name: '@electron-forge/maker-zip', // macOS
      platforms: ['darwin']
    },
    {
      name: '@electron-forge/maker-deb', // Linux
      config: {}
    }
  ]
}
```

### 6.2 自动更新
使用 electron-updater 实现自动更新

---

## 7. 性能优化建议

### 7.1 渲染性能
- 虚拟滚动（大文件编辑）
- 懒加载（标签页内容）
- Web Worker（文本处理）

### 7.2 数据库优化
- 建立索引
- 批量操作
- 连接池

### 7.3 内存优化
- 及时释放资源
- 使用 WeakMap/WeakSet
- 监控内存使用

---

## 8. 安全考虑

### 8.1 插件安全
- 插件沙箱环境
- 权限系统
- 代码审查

### 8.2 数据安全
- 本地数据加密（可选）
- 安全的云端通信（HTTPS）
- 敏感信息脱敏

---

## 9. 国际化实现

### 9.1 配置 Vue I18n
```typescript
// src/renderer/locales/zh-CN.json
{
  "app": {
    "name": "记忆笔记",
    "welcome": "欢迎使用记忆笔记"
  },
  "editor": {
    "newNote": "新建笔记",
    "save": "保存"
  }
}

// src/renderer/locales/en-US.json
{
  "app": {
    "name": "MemoryNote",
    "welcome": "Welcome to MemoryNote"
  },
  "editor": {
    "newNote": "New Note",
    "save": "Save"
  }
}
```

### 9.2 语言切换
```typescript
import { useI18n } from 'vue-i18n';

const { locale } = useI18n();
locale.value = 'en-US'; // 切换到英语
```

---

## 10. 总结

### 10.1 开发顺序
1. 阶段 0-1: 基础框架（5-7天）
2. 阶段 2-4: 核心服务（8-11天）
3. 阶段 5-7: 核心功能（14-19天）
4. 阶段 8-10: 扩展功能（10-14天）
5. 阶段 11: 插件系统（7-10天）
6. 阶段 12: AI 功能（7-10天）
7. 阶段 13: 云同步（可选，5-7天）
8. 阶段 14: 测试优化（持续）

**总计**: 约 56-78 天（不含云同步）

### 10.2 关键点
1. **接口优先**: 所有接口必须提前定义
2. **渐进式开发**: 每个阶段完成后进行测试
3. **文档同步**: 开发过程中及时更新文档
4. **代码审查**: 保证代码质量

### 10.3 风险控制
1. 编辑器选择可能需要调研时间
2. NLP/LLM 集成可能遇到 API 限制
3. 插件系统安全性需要特别关注
4. 性能优化需要持续迭代

---

## 附录 A: 依赖安装清单

```bash
# 生产依赖
npm install vue@^3.3.0 pinia@^2.1.0
npm install better-sqlite3@^9.0.0
npm install chokidar@^3.5.0  # 文件监控
npm install diff@^5.1.0  # diff 算法
npm install katex@^0.16.0  # 数学公式
npm install mermaid@^10.0.0  # 图表
npm install highlight.js@^11.9.0  # 代码高亮
npm install vue-i18n@^9.8.0  # 国际化

# 开发依赖
npm install -D tailwindcss@^3.4.0
npm install -D @types/better-sqlite3
npm install -D @types/diff
npm install -D autoprefixer postcss
npm install -D @milkdown/core @milkdown/preset-commonmark  # 编辑器（可选）
```

---

## 附录 B: 目录结构详细说明

```
src/
├── main/                    # 主进程
│   ├── index.ts            # 入口
│   ├── window/
│   │   └── WindowManager.ts
│   ├── database/
│   │   ├── DatabaseManager.ts
│   │   └── migrations/     # 数据库迁移
│   ├── services/
│   │   ├── ConfigService.ts
│   │   ├── FileService.ts
│   │   ├── NoteService.ts
│   │   ├── ReviewService.ts
│   │   ├── SearchService.ts
│   │   ├── NLPService.ts
│   │   └── LLMService.ts
│   └── plugins/
│       └── PluginManager.ts
├── preload/
│   └── index.ts            # IPC Bridge
├── renderer/
│   ├── main.ts             # 渲染进程入口
│   ├── App.vue
│   ├── views/              # 页面
│   │   ├── Editor.vue
│   │   ├── Review.vue
│   │   ├── Search.vue
│   │   └── Settings.vue
│   ├── components/         # 组件
│   │   ├── layout/
│   │   │   ├── Titlebar.vue
│   │   │   ├── Navbar.vue
│   │   │   ├── Sidebar.vue
│   │   │   └── Statusbar.vue
│   │   ├── editor/
│   │   │   └── MarkdownEditor.vue
│   │   ├── tabs/
│   │   │   ├── TabBar.vue
│   │   │   └── TabGroup.vue
│   │   └── common/
│   ├── stores/             # Pinia
│   │   ├── app.ts
│   │   ├── editor.ts
│   │   ├── tabs.ts
│   │   └── notes.ts
│   ├── services/
│   │   ├── CommandService.ts
│   │   ├── KeybindingService.ts
│   │   ├── NotificationService.ts
│   │   ├── TabService.ts
│   │   └── ThemeService.ts
│   ├── composables/        # 组合式函数
│   │   ├── useIPC.ts
│   │   ├── useCommands.ts
│   │   └── useEditor.ts
│   └── locales/            # 国际化
│       ├── zh-CN.json
│       └── en-US.json
├── shared/                 # 共享代码
│   ├── types/
│   ├── constants/
│   └── interfaces/
└── plugins-api/            # 插件 API
    ├── index.ts
    ├── types.ts
    └── api.ts
```

---

**文档版本**: 1.0.0  
**最后更新**: 2025-10-21  
**作者**: MemoryNote Team


