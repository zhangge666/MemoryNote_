<template>
  <div class="test-view">
    <div class="test-header">
      <h2 class="text-2xl font-bold mb-4">阶段 2 功能测试</h2>
      <p class="text-text-secondary mb-6">文件系统 & 数据库测试</p>
    </div>

    <!-- 文件系统测试 -->
    <div class="test-section">
      <h3 class="section-title">📁 文件系统测试</h3>
      <div class="test-actions">
        <button @click="testFileWrite" class="test-btn">
          写入测试文件
        </button>
        <button @click="testFileRead" class="test-btn">
          读取测试文件
        </button>
        <button @click="testFileDelete" class="test-btn">
          删除测试文件
        </button>
        <button @click="testDirOperations" class="test-btn">
          测试目录操作
        </button>
      </div>
      <div v-if="fileTestResult" class="test-result">
        <pre>{{ fileTestResult }}</pre>
      </div>
    </div>

    <!-- 数据库测试 -->
    <div class="test-section">
      <h3 class="section-title">🗄️ 数据库测试</h3>
      <div class="test-actions">
        <button @click="testDbInsert" class="test-btn">
          插入测试笔记
        </button>
        <button @click="testDbQuery" class="test-btn">
          查询所有笔记
        </button>
        <button @click="testDbUpdate" class="test-btn">
          更新笔记
        </button>
        <button @click="testDbDelete" class="test-btn">
          删除笔记
        </button>
      </div>
      <div v-if="dbTestResult" class="test-result">
        <pre>{{ dbTestResult }}</pre>
      </div>
    </div>

    <!-- 综合测试 -->
    <div class="test-section">
      <h3 class="section-title">🚀 综合测试</h3>
      <div class="test-actions">
        <button @click="runAllTests" class="test-btn primary">
          运行所有测试
        </button>
        <button @click="clearResults" class="test-btn">
          清除结果
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useIPC } from '@renderer/composables/useIPC';

const ipc = useIPC();
const fileTestResult = ref('');
const dbTestResult = ref('');

// 文件系统测试
async function testFileWrite() {
  try {
    const content = `测试文件内容\n创建时间: ${new Date().toLocaleString()}`;
    const result = await ipc.invoke('file:write', 'test/test.txt', content);
    fileTestResult.value = JSON.stringify(result, null, 2);
  } catch (error: any) {
    fileTestResult.value = `错误: ${error.message}`;
  }
}

async function testFileRead() {
  try {
    const result = await ipc.invoke('file:read', 'test/test.txt');
    fileTestResult.value = JSON.stringify(result, null, 2);
  } catch (error: any) {
    fileTestResult.value = `错误: ${error.message}`;
  }
}

async function testFileDelete() {
  try {
    const result = await ipc.invoke('file:delete', 'test/test.txt');
    fileTestResult.value = JSON.stringify(result, null, 2);
  } catch (error: any) {
    fileTestResult.value = `错误: ${error.message}`;
  }
}

async function testDirOperations() {
  try {
    // 创建目录
    await ipc.invoke('dir:create', 'test/subdir');
    
    // 读取目录
    const result = await ipc.invoke('dir:read', 'test');
    
    fileTestResult.value = `目录内容:\n${JSON.stringify(result, null, 2)}`;
  } catch (error: any) {
    fileTestResult.value = `错误: ${error.message}`;
  }
}

// 数据库测试
async function testDbInsert() {
  try {
    const now = Date.now();
    const result = await ipc.invoke(
      'db:execute',
      'INSERT INTO notes (title, path, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
      ['测试笔记', '/test/note1.md', '# 测试笔记\n\n这是一个测试笔记', now, now]
    );
    dbTestResult.value = `插入成功:\n${JSON.stringify(result, null, 2)}`;
  } catch (error: any) {
    dbTestResult.value = `错误: ${error.message}`;
  }
}

async function testDbQuery() {
  try {
    const result = await ipc.invoke('db:query', 'SELECT * FROM notes ORDER BY created_at DESC');
    dbTestResult.value = `查询结果:\n${JSON.stringify(result, null, 2)}`;
  } catch (error: any) {
    dbTestResult.value = `错误: ${error.message}`;
  }
}

async function testDbUpdate() {
  try {
    const now = Date.now();
    const result = await ipc.invoke(
      'db:execute',
      'UPDATE notes SET title = ?, content = ?, updated_at = ? WHERE path = ?',
      ['更新后的标题', '# 更新后的内容\n\n已更新', now, '/test/note1.md']
    );
    dbTestResult.value = `更新成功:\n${JSON.stringify(result, null, 2)}`;
  } catch (error: any) {
    dbTestResult.value = `错误: ${error.message}`;
  }
}

async function testDbDelete() {
  try {
    const result = await ipc.invoke('db:execute', 'DELETE FROM notes WHERE path = ?', ['/test/note1.md']);
    dbTestResult.value = `删除成功:\n${JSON.stringify(result, null, 2)}`;
  } catch (error: any) {
    dbTestResult.value = `错误: ${error.message}`;
  }
}

// 运行所有测试
async function runAllTests() {
  fileTestResult.value = '正在运行文件系统测试...';
  dbTestResult.value = '正在运行数据库测试...';

  try {
    // 文件测试
    await testFileWrite();
    await new Promise((resolve) => setTimeout(resolve, 500));
    await testFileRead();
    await new Promise((resolve) => setTimeout(resolve, 500));
    await testDirOperations();

    // 数据库测试
    await new Promise((resolve) => setTimeout(resolve, 500));
    await testDbInsert();
    await new Promise((resolve) => setTimeout(resolve, 500));
    await testDbQuery();

    fileTestResult.value += '\n\n✅ 文件系统测试完成';
    dbTestResult.value += '\n\n✅ 数据库测试完成';
  } catch (error: any) {
    fileTestResult.value = `测试失败: ${error.message}`;
    dbTestResult.value = `测试失败: ${error.message}`;
  }
}

function clearResults() {
  fileTestResult.value = '';
  dbTestResult.value = '';
}
</script>

<style scoped>
.test-view {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.test-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--color-border);
}

.test-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: var(--color-background-secondary);
  border-radius: 12px;
  border: 1px solid var(--color-border);
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--color-text);
}

.test-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.test-btn {
  padding: 0.5rem 1rem;
  background: var(--color-background-tertiary);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-text);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.test-btn:hover {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.test-btn.primary {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.test-btn.primary:hover {
  opacity: 0.9;
}

.test-result {
  margin-top: 1rem;
  padding: 1rem;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  max-height: 300px;
  overflow-y: auto;
}

.test-result pre {
  margin: 0;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 0.875rem;
  color: var(--color-text);
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>


