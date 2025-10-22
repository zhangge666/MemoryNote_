# 记忆笔记 (MemoryNote)

一款基于 Electron 的个人知识库管理软件，集成了笔记编辑、复习系统、智能检索、插件扩展等功能。

## 功能特性

- ✍️ **Markdown 编辑器**: 即时渲染模式 + 阅读模式，支持数学公式、代码高亮、图表等
- 🔌 **插件系统**: 可扩展的架构设计，支持自定义功能扩展
- 📚 **复习系统**: 基于 diff 算法的智能复习，支持多种复习算法
- 🤖 **AI 增强**: NLP 语义检索 + LLM 智能问答
- 🎨 **主题系统**: 可自定义的界面主题
- 📑 **标签页系统**: 支持分屏和嵌套布局
- ⌨️ **命令系统**: 全局命令调度和快捷键绑定
- 🌍 **国际化**: 支持中文和英文

## 技术栈

- **框架**: Electron + Electron Forge
- **前端**: Vue 3 + TypeScript + Vite
- **状态管理**: Pinia
- **样式**: TailwindCSS
- **数据库**: SQLite3
- **国际化**: Vue I18n

## 项目结构

```
MemoryNote/
├── src/
│   ├── main/                 # 主进程
│   │   ├── window/          # 窗口管理
│   │   ├── ipc/             # IPC 通信
│   │   ├── database/        # 数据库管理
│   │   ├── plugins/         # 插件加载器
│   │   └── services/        # 主进程服务
│   ├── preload/             # 预加载脚本
│   ├── renderer/            # 渲染进程
│   │   ├── views/           # 页面组件
│   │   ├── components/      # 通用组件
│   │   ├── stores/          # Pinia 状态管理
│   │   ├── services/        # 渲染进程服务
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

## 开发指南

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm start
```

### 代码检查

```bash
# 检查代码
npm run lint

# 自动修复
npm run lint:fix

# 格式化代码
npm run format

# 检查格式
npm run format:check
```

### 打包构建

```bash
# 打包应用
npm run package

# 构建安装包
npm run make
```

## 开发阶段

项目采用分阶段开发方式，详细规划请查看 [开发文档](dev/dev.md)。

### 已完成

- [x] 阶段 0: 项目初始化
  - [x] 安装依赖包
  - [x] 配置 TailwindCSS
  - [x] 配置 Vue I18n
  - [x] 创建目录结构
  - [x] 配置 Prettier
  - [x] 编写基础类型定义

### 进行中

- [ ] 阶段 1: 核心框架搭建
  - [ ] 实现自定义标题栏
  - [ ] 实现窗口控制
  - [ ] 实现侧边栏伸缩
  - [ ] 实现基础布局组件
  - [ ] 实现 IPC 通信框架
  - [ ] 实现配置管理系统
  - [ ] 实现国际化框架

## 配置说明

### 默认配置

- 工作目录: `workspace/`
- 插件目录: `workspace/.plugins/`
- 默认语言: 简体中文 (zh-CN)
- 默认主题: 亮色主题 (light)

### 快捷键

| 功能 | Windows/Linux | macOS |
|------|--------------|-------|
| 新建笔记 | Ctrl+N | Cmd+N |
| 保存 | Ctrl+S | Cmd+S |
| 打开文件 | Ctrl+O | Cmd+O |
| 关闭标签 | Ctrl+W | Cmd+W |
| 查找 | Ctrl+F | Cmd+F |
| 替换 | Ctrl+H | Cmd+H |
| 命令面板 | Ctrl+Shift+P | Cmd+Shift+P |
| 切换侧边栏 | Ctrl+B | Cmd+B |

## 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

MIT License

## 作者

zhangge666 (2395217248@qq.com)

---

**注意**: 本项目正在积极开发中，功能可能不完整或有变化。


