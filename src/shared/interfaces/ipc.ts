/**
 * IPC 通信接口定义
 * 阶段 0: 项目初始化
 */

/**
 * IPC 响应
 */
export interface IPCResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * IPC 频道枚举
 */
export enum IPCChannel {
  // ==================== 窗口管理 ====================
  WINDOW_MINIMIZE = 'window:minimize',
  WINDOW_MAXIMIZE = 'window:maximize',
  WINDOW_CLOSE = 'window:close',
  WINDOW_TOGGLE_FULLSCREEN = 'window:toggle-fullscreen',
  WINDOW_IS_MAXIMIZED = 'window:is-maximized',
  WINDOW_IS_FULLSCREEN = 'window:is-fullscreen',

  // ==================== 配置管理 ====================
  CONFIG_GET = 'config:get',
  CONFIG_GET_ALL = 'config:get-all',
  CONFIG_SET = 'config:set',
  CONFIG_SET_ALL = 'config:set-all',
  CONFIG_RESET = 'config:reset',
  CONFIG_CHANGED = 'config:changed',

  // ==================== 文件操作 ====================
  FILE_READ = 'file:read',
  FILE_READ_BUFFER = 'file:read-buffer',
  FILE_WRITE = 'file:write',
  FILE_WRITE_BUFFER = 'file:write-buffer',
  FILE_DELETE = 'file:delete',
  FILE_EXISTS = 'file:exists',
  FILE_STAT = 'file:stat',
  FILE_WATCH = 'file:watch',
  FILE_UNWATCH = 'file:unwatch',
  FILE_CHANGED = 'file:changed',

  // ==================== 目录操作 ====================
  DIR_READ = 'dir:read',
  DIR_CREATE = 'dir:create',
  DIR_DELETE = 'dir:delete',

  // ==================== 路径工具 ====================
  PATH_JOIN = 'path:join',
  PATH_DIRNAME = 'path:dirname',
  PATH_BASENAME = 'path:basename',
  PATH_EXTNAME = 'path:extname',

  // ==================== 数据库操作 ====================
  DB_QUERY = 'db:query',
  DB_QUERY_ONE = 'db:query-one',
  DB_EXECUTE = 'db:execute',
  DB_EXECUTE_BATCH = 'db:execute-batch',
  DB_TRANSACTION = 'db:transaction',

  // ==================== 笔记操作 ====================
  NOTE_CREATE = 'note:create',
  NOTE_GET = 'note:get',
  NOTE_GET_BY_PATH = 'note:get-by-path',
  NOTE_UPDATE = 'note:update',
  NOTE_UPDATE_CONTENT = 'note:update-content',
  NOTE_DELETE = 'note:delete',
  NOTE_QUERY = 'note:query',
  NOTE_GET_ALL = 'note:get-all',
  NOTE_ADD_TAG = 'note:add-tag',
  NOTE_REMOVE_TAG = 'note:remove-tag',
  NOTE_GET_ALL_TAGS = 'note:get-all-tags',
  NOTE_IMPORT = 'note:import',
  NOTE_EXPORT = 'note:export',

  // ==================== 复习系统 ====================
  REVIEW_GENERATE_CARDS = 'review:generate-cards',
  REVIEW_GET_DUE_CARDS = 'review:get-due-cards',
  REVIEW_GET_CARDS_BY_NOTE = 'review:get-cards-by-note',
  REVIEW_GET_CARD = 'review:get-card',
  REVIEW_REVIEW_CARD = 'review:review-card',
  REVIEW_SKIP_CARD = 'review:skip-card',
  REVIEW_DELETE_CARD = 'review:delete-card',
  REVIEW_GET_STATS = 'review:get-stats',

  // ==================== 搜索 ====================
  SEARCH_SEARCH = 'search:search',
  SEARCH_GET_HISTORY = 'search:get-history',
  SEARCH_ADD_HISTORY = 'search:add-history',
  SEARCH_CLEAR_HISTORY = 'search:clear-history',
  SEARCH_BUILD_INDEX = 'search:build-index',
  SEARCH_UPDATE_INDEX = 'search:update-index',

  // ==================== 插件系统 ====================
  PLUGIN_LOAD = 'plugin:load',
  PLUGIN_LOAD_ALL = 'plugin:load-all',
  PLUGIN_UNLOAD = 'plugin:unload',
  PLUGIN_ENABLE = 'plugin:enable',
  PLUGIN_DISABLE = 'plugin:disable',
  PLUGIN_GET = 'plugin:get',
  PLUGIN_GET_ALL = 'plugin:get-all',
  PLUGIN_GET_ENABLED = 'plugin:get-enabled',
  PLUGIN_INSTALL = 'plugin:install',
  PLUGIN_UNINSTALL = 'plugin:uninstall',

  // ==================== 主题系统 ====================
  THEME_LOAD = 'theme:load',
  THEME_GET_CURRENT = 'theme:get-current',
  THEME_GET = 'theme:get',
  THEME_GET_ALL = 'theme:get-all',
  THEME_INSTALL = 'theme:install',
  THEME_UNINSTALL = 'theme:uninstall',
  THEME_CHANGED = 'theme:changed',

  // ==================== NLP & LLM ====================
  NLP_VECTORIZE = 'nlp:vectorize',
  NLP_SEMANTIC_SEARCH = 'nlp:semantic-search',
  NLP_ADD_TO_INDEX = 'nlp:add-to-index',
  NLP_REMOVE_FROM_INDEX = 'nlp:remove-from-index',
  NLP_REBUILD_INDEX = 'nlp:rebuild-index',

  LLM_SET_CONFIG = 'llm:set-config',
  LLM_GET_CONFIG = 'llm:get-config',
  LLM_CHAT = 'llm:chat',
  LLM_ASK_WITH_CONTEXT = 'llm:ask-with-context',
  LLM_CHECK_CONTENT = 'llm:check-content',
  LLM_CHAT_STREAM = 'llm:chat-stream',
  LLM_CHAT_STREAM_CHUNK = 'llm:chat-stream-chunk',

  // ==================== 用户系统 ====================
  AUTH_LOGIN = 'auth:login',
  AUTH_REGISTER = 'auth:register',
  AUTH_LOGOUT = 'auth:logout',
  AUTH_REFRESH_TOKEN = 'auth:refresh-token',
  AUTH_VALIDATE_TOKEN = 'auth:validate-token',
  AUTH_GET_CURRENT_USER = 'auth:get-current-user',
  AUTH_UPDATE_USER = 'auth:update-user',

  // ==================== 同步系统 ====================
  SYNC_START = 'sync:start',
  SYNC_STOP = 'sync:stop',
  SYNC_NOW = 'sync:sync-now',
  SYNC_GET_STATUS = 'sync:get-status',
  SYNC_RESOLVE_CONFLICT = 'sync:resolve-conflict',
  SYNC_GET_CONFLICTS = 'sync:get-conflicts',
  SYNC_STATUS_CHANGED = 'sync:status-changed',

  // ==================== 应用信息 ====================
  APP_GET_VERSION = 'app:get-version',
  APP_GET_WORKSPACE = 'app:get-workspace',
  APP_SET_WORKSPACE = 'app:set-workspace',
  APP_GET_PATH = 'app:get-path',
}

/**
 * IPC 事件订阅
 */
export interface IPCEventSubscription {
  channel: string;
  handler: (...args: unknown[]) => void;
}

