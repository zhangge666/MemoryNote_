# 数据库修复指南

## 问题说明

你遇到的 `database disk image is malformed` 错误是由于数据库文件损坏导致的。这可能由以下原因引起：

1. **并发写入冲突** - 多个进程同时写入数据库
2. **程序异常退出** - 在写入过程中程序崩溃
3. **文件系统错误** - 磁盘问题或突然断电

## 已实施的修复

### 1. WAL模式和性能优化 ✅
- 启用WAL（Write-Ahead Logging）模式，提高并发性能
- 设置3秒忙碌超时，避免锁定
- 优化同步模式为NORMAL

### 2. 数据库完整性检查 ✅
- 启动时自动检查数据库完整性
- 如果检测到损坏，自动备份并重建

### 3. FileWatcher防护 ✅
- 防止循环更新导致的并发冲突
- 忽略应用内部写入触发的文件事件

## 立即解决方案

### 方案1：重启应用（推荐）

1. **完全关闭应用**
2. **重新启动应用**

应用会自动：
- 检测数据库是否损坏
- 如果损坏，自动备份旧数据库
- 创建新的干净数据库
- 重新运行迁移

### 方案2：手动删除数据库文件

如果自动修复失败，手动删除以下文件：

**Windows 路径：**
```
C:\Users\<你的用户名>\AppData\Roaming\MemoryNote\workspace\memorynote.db
C:\Users\<你的用户名>\AppData\Roaming\MemoryNote\workspace\memorynote.db-wal
C:\Users\<你的用户名>\AppData\Roaming\MemoryNote\workspace\memorynote.db-shm
```

**macOS 路径：**
```
~/Library/Application Support/MemoryNote/workspace/memorynote.db
~/Library/Application Support/MemoryNote/workspace/memorynote.db-wal
~/Library/Application Support/MemoryNote/workspace/memorynote.db-shm
```

**Linux 路径：**
```
~/.config/MemoryNote/workspace/memorynote.db
~/.config/MemoryNote/workspace/memorynote.db-wal
~/.config/MemoryNote/workspace/memorynote.db-shm
```

删除后重启应用，数据库会自动重建。

**⚠️ 注意：这会清空所有笔记的元数据（但Markdown文件不会被删除）**

## 验证修复

重启应用后，查看控制台输出：

✅ **成功的日志**：
```
✅ Database initialized with WAL mode
📊 Journal mode set to: wal
✅ Services initialized
```

❌ **失败的日志**：
```
❌ Database is corrupted, attempting recovery...
🔧 Starting database recovery...
💾 Corrupted database backed up to: ...
✅ New database created
```

## 预防措施

1. **定期备份** - 笔记文件在 `workspace/notes/` 目录
2. **正常退出** - 使用窗口关闭按钮而不是强制结束进程
3. **避免同时运行多个实例** - 不要同时打开多个MemoryNote窗口

## 技术细节

### 已修复的文件

1. `src/main/database/DatabaseManager.ts`
   - 添加数据库完整性检查
   - 添加自动恢复功能
   - 启用WAL模式
   - 优化性能参数

2. `src/main/services/FileWatcherService.ts`
   - 添加防循环更新机制
   - 添加并发保护

3. `src/main/services/FileSystemService.ts`
   - 在写入时通知FileWatcher忽略变化

4. `src/main.ts`
   - 连接FileWatcher和FileSystemService
   - 正确关闭数据库连接

### WAL模式优势

- **读写并发** - 读取不会阻塞写入
- **更好的性能** - 批量提交事务
- **更可靠** - 减少数据损坏风险
- **自动检查点** - 定期合并WAL文件

## 需要帮助？

如果问题持续存在，请提供：
1. 控制台完整日志
2. 操作系统版本
3. 数据库文件大小
4. 是否使用了云同步（OneDrive, Dropbox等）


