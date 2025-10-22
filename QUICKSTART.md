# 快速开始指南

## 前置要求

- Node.js 16.x 或更高版本
- npm 或 yarn 包管理器

## 安装

```bash
# 克隆仓库（如果从 Git 获取）
git clone <repository-url>
cd MemoryNote

# 安装依赖
npm install
```

## 开发

```bash
# 启动开发服务器
npm start
```

应用将以开发模式启动，你应该能看到：
- 一个 Electron 窗口
- 欢迎界面，显示"欢迎使用记忆笔记"
- 两个语言切换按钮（简体中文/English）

## 可用命令

```bash
# 启动开发服务器
npm start

# 代码检查
npm run lint

# 自动修复代码问题
npm run lint:fix

# 格式化代码
npm run format

# 检查代码格式
npm run format:check

# 打包应用
npm run package

# 构建安装包
npm run make
```

## 项目结构

```
MemoryNote/
├── src/
│   ├── main/           # Electron 主进程
│   ├── preload/        # 预加载脚本
│   ├── renderer/       # 渲染进程（Vue 应用）
│   ├── shared/         # 共享代码（类型、常量、接口）
│   └── plugins-api/    # 插件 API
├── workspace/          # 用户工作目录
├── dev/                # 开发文档
└── tests/              # 测试文件
```

## 开发进度

### ✅ 阶段 0: 项目初始化（已完成）
- 依赖安装
- TailwindCSS 配置
- Vue I18n 配置
- 目录结构创建
- 代码规范配置
- 基础类型定义

### 🚧 阶段 1: 核心框架搭建（进行中）
- 自定义标题栏
- 窗口控制
- 侧边栏伸缩
- 基础布局
- IPC 通信
- 配置管理

更多开发阶段详情请查看 [开发文档](dev/dev.md)。

## 常见问题

### 1. 启动报错

如果遇到启动错误，尝试：
```bash
# 清除缓存
rm -rf node_modules .vite dist
npm install
npm start
```

### 2. TypeScript 错误

确保已安装所有类型定义：
```bash
npm install -D @types/node
```

### 3. ESLint 警告

运行自动修复：
```bash
npm run lint:fix
```

## 贡献

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

MIT License - 查看 [LICENSE](LICENSE) 文件了解详情

## 联系方式

- 作者: zhangge666
- Email: 2395217248@qq.com

---

**祝开发愉快！** 🎉


