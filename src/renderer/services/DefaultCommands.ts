/**
 * 默认系统命令
 */

import { Command, CommandCategory } from '@shared/types/command';
import { getCommandService } from './CommandService';
import { getKeybindingService } from './KeybindingService';
import { useCommandStore } from '@renderer/stores/command';
import { useSidebarStore } from '@renderer/stores/sidebar';
import { useNotificationStore } from '@renderer/stores/notification';

/**
 * 注册所有默认命令
 */
export function registerDefaultCommands(): void {
  const commandService = getCommandService();
  const keybindingService = getKeybindingService();

  // 注册所有默认命令
  DEFAULT_COMMANDS.forEach((command) => {
    commandService.registerCommand(command);
    
    // 如果命令有快捷键，也注册快捷键绑定
    if (command.keybinding) {
      keybindingService.registerKeybinding({
        key: command.keybinding,
        command: command.id,
        when: command.when,
      });
    }
  });
}

/**
 * 默认命令列表
 */
const DEFAULT_COMMANDS: Command[] = [
  // ============ 视图命令 ============
  {
    id: 'view.toggleLeftSidebar',
    title: '切换左侧栏',
    category: CommandCategory.VIEW,
    keybinding: 'Ctrl+B',
    handler: () => {
      const sidebarStore = useSidebarStore();
      sidebarStore.toggleLeft();
    },
  },
  {
    id: 'view.toggleRightSidebar',
    title: '切换右侧栏',
    category: CommandCategory.VIEW,
    keybinding: 'Ctrl+Shift+B',
    handler: () => {
      const sidebarStore = useSidebarStore();
      sidebarStore.toggleRight();
    },
  },
  {
    id: 'view.commandPalette',
    title: '打开命令面板',
    category: CommandCategory.VIEW,
    keybinding: 'Ctrl+Shift+P',
    handler: () => {
      const commandStore = useCommandStore();
      commandStore.toggleCommandPalette();
    },
  },

  // ============ 文件命令 ============
  {
    id: 'file.newNote',
    title: '新建笔记',
    category: CommandCategory.FILE,
    keybinding: 'Ctrl+N',
    handler: () => {
      // TODO: 实现新建笔记功能
    },
  },
  {
    id: 'file.saveNote',
    title: '保存笔记',
    category: CommandCategory.FILE,
    keybinding: 'Ctrl+S',
    when: 'editorFocus',
    handler: () => {
      // TODO: 实现保存笔记功能
    },
  },
  {
    id: 'file.closeNote',
    title: '关闭笔记',
    category: CommandCategory.FILE,
    keybinding: 'Ctrl+W',
    when: 'activeNote',
    handler: () => {
      // TODO: 实现关闭笔记功能
    },
  },

  // ============ 编辑命令 ============
  {
    id: 'edit.undo',
    title: '撤销',
    category: CommandCategory.EDIT,
    keybinding: 'Ctrl+Z',
    when: 'editorFocus',
    handler: () => {
      document.execCommand('undo');
    },
  },
  {
    id: 'edit.redo',
    title: '重做',
    category: CommandCategory.EDIT,
    keybinding: 'Ctrl+Y',
    when: 'editorFocus',
    handler: () => {
      document.execCommand('redo');
    },
  },
  {
    id: 'edit.cut',
    title: '剪切',
    category: CommandCategory.EDIT,
    keybinding: 'Ctrl+X',
    when: 'editorFocus && selectedText',
    handler: () => {
      document.execCommand('cut');
    },
  },
  {
    id: 'edit.copy',
    title: '复制',
    category: CommandCategory.EDIT,
    keybinding: 'Ctrl+C',
    when: 'selectedText',
    handler: () => {
      document.execCommand('copy');
    },
  },
  {
    id: 'edit.paste',
    title: '粘贴',
    category: CommandCategory.EDIT,
    keybinding: 'Ctrl+V',
    when: 'editorFocus',
    handler: () => {
      document.execCommand('paste');
    },
  },
  {
    id: 'edit.selectAll',
    title: '全选',
    category: CommandCategory.EDIT,
    keybinding: 'Ctrl+A',
    handler: () => {
      document.execCommand('selectAll');
    },
  },
  {
    id: 'edit.find',
    title: '查找',
    category: CommandCategory.EDIT,
    keybinding: 'Ctrl+F',
    handler: () => {
      // TODO: 实现查找功能
    },
  },
  {
    id: 'edit.replace',
    title: '替换',
    category: CommandCategory.EDIT,
    keybinding: 'Ctrl+H',
    when: 'editorFocus',
    handler: () => {
      // TODO: 实现替换功能
    },
  },

  // ============ 导航命令 ============
  {
    id: 'navigation.goToNotes',
    title: '转到笔记',
    category: CommandCategory.NAVIGATION,
    keybinding: 'Ctrl+1',
    handler: () => {
      // TODO: 实现导航到笔记功能
    },
  },
  {
    id: 'navigation.goToJournal',
    title: '转到日志',
    category: CommandCategory.NAVIGATION,
    keybinding: 'Ctrl+2',
    handler: () => {
      // TODO: 实现导航到日志功能
    },
  },
  {
    id: 'navigation.goToReview',
    title: '转到复习',
    category: CommandCategory.NAVIGATION,
    keybinding: 'Ctrl+3',
    handler: () => {
      // TODO: 实现导航到复习功能
    },
  },
  {
    id: 'navigation.goToSearch',
    title: '转到搜索',
    category: CommandCategory.NAVIGATION,
    keybinding: 'Ctrl+4',
    handler: () => {
      // TODO: 实现导航到搜索功能
    },
  },

  // ============ 搜索命令 ============
  {
    id: 'search.globalSearch',
    title: '全局搜索',
    category: CommandCategory.SEARCH,
    keybinding: 'Ctrl+Shift+F',
    handler: () => {
      // TODO: 实现全局搜索功能
    },
  },

  // ============ 系统命令 ============
  {
    id: 'system.reload',
    title: '重新加载',
    category: CommandCategory.SYSTEM,
    keybinding: 'Ctrl+R',
    handler: () => {
      window.location.reload();
    },
  },
  {
    id: 'system.toggleDevTools',
    title: '切换开发者工具',
    category: CommandCategory.SYSTEM,
    keybinding: 'Ctrl+Shift+I',
    handler: async () => {
      // 通过 IPC 调用主进程打开开发者工具
      if (window.electronAPI) {
        try {
          await window.electronAPI.invoke('toggle-dev-tools');
        } catch (error) {
          // Failed to toggle dev tools
        }
      }
    },
  },

  // ============ 测试命令（仅用于开发） ============
  {
    id: 'test.notificationInfo',
    title: '测试信息通知',
    category: CommandCategory.SYSTEM,
    handler: () => {
      const notificationStore = useNotificationStore();
      notificationStore.info('这是一条信息通知', {
        title: '信息',
      });
    },
  },
  {
    id: 'test.notificationSuccess',
    title: '测试成功通知',
    category: CommandCategory.SYSTEM,
    handler: () => {
      const notificationStore = useNotificationStore();
      notificationStore.success('操作已成功完成！', {
        title: '成功',
      });
    },
  },
  {
    id: 'test.notificationWarning',
    title: '测试警告通知',
    category: CommandCategory.SYSTEM,
    handler: () => {
      const notificationStore = useNotificationStore();
      notificationStore.warning('请注意，这是一条警告消息', {
        title: '警告',
      });
    },
  },
  {
    id: 'test.notificationError',
    title: '测试错误通知',
    category: CommandCategory.SYSTEM,
    handler: () => {
      const notificationStore = useNotificationStore();
      notificationStore.error('发生了一个错误！', {
        title: '错误',
      });
    },
  },
  {
    id: 'test.notificationWithActions',
    title: '测试带动作的通知',
    category: CommandCategory.SYSTEM,
    handler: () => {
      const notificationStore = useNotificationStore();
      notificationStore.info('你有新的消息', {
        title: '新消息',
        duration: 0,
        actions: [
          {
            label: '查看',
            primary: true,
            handler: () => {
              notificationStore.success('已打开消息');
            },
          },
          {
            label: '忽略',
            handler: () => {
              // Ignore message
            },
          },
        ],
      });
    },
  },
];

