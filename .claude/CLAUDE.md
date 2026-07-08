# 全栈学习笔记

本仓库包含两类内容：**学习笔记**（`note/`）和**代码实践**（`src/`）。

## 学习笔记

笔记存放于 `note/` 目录，按主题分子目录，目录名即主题。语言为中文，格式为 markdown。

### 笔记目录

`accessibility` / `ai` / `browser` / `css` / `database` / `design` / `engineering` / `git` / `golang` / `html` / `java` / `js` / `mobile` / `nestjs` / `nextjs` / `nodejs` / `performance` / `python` / `react` / `redis` / `security` / `static` / `tricks` / `ts` / `unit-test` / `vue` / `webpack`

### 笔记与代码的对应关系

`note/` 下的笔记常与 `src/` 下的代码实践一一对应，例如：

- `note/js/Debounce_Throttle.md` ↔ `src/functions/debounce.js`、`src/functions/throttle.js`
- `note/browser/WebSocket.md` ↔ `src/websocket/`
- `note/browser/SSE.md` ↔ `src/sse/`

新增或修改笔记时，若存在对应代码实现，应同步更新；反之亦然。

### Markdown 格式规范

#### 1. 基础结构

```markdown
# 笔记标题（一级标题，仅用于文档顶部）

> 简短描述或摘要（可选）

## 章节标题（二级标题）

### 小节标题（三级标题）

正文内容...
```

#### 2. 代码块

- **代码块必须指定语言**，如 `javascript`、`typescript`、`css`、`html`
- **代码应附带解释**，避免纯代码堆砌
- **代码应贴合实际场景**，避免过于抽象的示例，直接对应技术三要素中的「应用场景」
- **关键代码必须添加中文注释**

```javascript
// 实际场景中的防抖函数
function debounce(func, delay) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

// 应用场景：搜索框输入防抖
const searchInput = document.querySelector("#search");
searchInput.addEventListener(
  "input",
  debounce((e) => {
    console.log("搜索:", e.target.value);
  }, 500),
);
```

#### 3. 标记与排版

- **重要概念**：使用加粗
- `代码标识`：使用反引号包裹
- ~~错误理解~~：使用删除线标记错误
- > 提示：使用引用块标注提示信息

#### 4. 列表与表格

- 有序列表用于步骤说明，无序列表用于要点列举
- 表格用于对比和总结：

| 特性 | 优点         | 缺点         | 适用场景   |
| ---- | ------------ | ------------ | ---------- |
| 防抖 | 减少调用频率 | 可能延迟响应 | 输入框搜索 |
| 节流 | 稳定调用频率 | 可能遗漏调用 | 滚动事件   |

#### 5. 语言与标点

- 使用 **中文** 编写，使用中文标点符号（，。：；？！）
- 技术术语保持英文原名（如 `Promise`、`Closure`）
- 中英文混排时，英文前后加空格
- 笔记正文不使用 Emoji，保持内容专业简洁

### 内容要求

- **技术三要素**：技术概念必须涵盖「是什么、为什么选择这项技术、有什么应用场景」
- **面试导向**：知识要点以面试常见问题为中心，聚焦高频考点和易错点
- **客观陈述**：避免「简单来说」「可以理解为」等口语化表述；删除人称代词，使用第三人称客观描述；避免「门卫」「翻译 + 管家」等生活化比喻，使用专业技术术语
- **引用来源**：如有参考外部资料，应在文末标注

### 事实核查范围

涉及以下内容时，先搜索核实再编写：**版本特性、API 签名、浏览器兼容性、具体数值、时效性内容**。通用基础概念无需强制搜索。

## 代码实践

代码实践统一存放于 `src/` 目录。

### 目录结构

```
src/
├── leetcode/        # LeetCode 题解（按 tag 分子目录）
├── algorithms/      # 常见算法与数据结构实现
├── functions/       # JavaScript 工具函数
├── css/             # CSS 场景实践
├── designPattern/   # 设计模式
├── hooks/           # React 自定义 Hook
├── challenges/      # 笔试题实现
├── java/            # Java 代码实践
├── sse/             # SSE 示例
├── websocket/       # WebSocket 示例
└── script/          # 复习脚本（随机抽取 LeetCode，不参与代码实践分类）
```

### 工程配置（必须遵循）

仓库已有的配置文件是代码风格的唯一权威来源，新增代码必须符合：

- [.eslintrc.json](.eslintrc.json)：2 空格缩进、双引号、必加分号、`SwitchCase` 1 缩进、`no-unused-vars` 为 warn
- [.editorconfig](.editorconfig)：LF 换行、UTF-8、不插入文件末尾换行、去除行尾空白
- [jsconfig.json](jsconfig.json)：路径别名 `@/*` → `src/*`；`note` 目录被 exclude，不参与编译

### LeetCode 题解规范

- **文件名**：`序号.题名.js`（如 `1.两数和.js`、`128.最长连续序列.js`）；剑指 Offer 用 `JZ` 前缀
- **目录**：按主题放入对应 tag 子目录，现有 tag：
  `array` / `backTrack` / `bfs` / `binaryTree` / `bit` / `bst` / `dfs` / `dp` / `dualPointer` / `graph` / `greedy` / `js` / `knapsack` / `linkedList` / `math` / `preSum` / `search` / `slidingWindow` / `sort` / `stack` / `string`
- **语言**：主要使用 JavaScript；涉及类型特性（如记忆函数、有时间限制的缓存）使用 TypeScript
- **内容**：包含题目描述、解题思路、代码实现、复杂度分析

### 其他代码实践

- **algorithms/**：面试高频算法、经典数据结构、复杂度分析
- **functions/**：工具函数实现、常见面试题、函数式编程实践
- **css/**：布局技巧、经典面试题、响应式设计
- **designPattern/**：面向对象设计模式、实际应用场景
- **hooks/**：自定义 Hook、状态管理、副作用处理
- **challenges/**：各公司笔试题实现
- **文件命名**：语义化，与同目录现有文件保持风格一致（如 `debounce.js`、`useFocusOut.tsx`）

## 质量检查清单

### 笔记

- [ ] 代码块已标注语言
- [ ] 技术三要素齐全（是什么 / 为什么 / 应用场景）
- [ ] 代码示例贴合实际场景且可运行
- [ ] 涉及版本、API、兼容性等内容已搜索核实
- [ ] 格式符合规范（中文标点、中英文空格、无 Emoji）

### 代码

- [ ] 符合 `.eslintrc.json` 与 `.editorconfig`
- [ ] 新增 LeetCode 文件放入正确 tag 子目录，命名 `序号.题名.js`
- [ ] 路径引用使用 `@/*` 别名
- [ ] 关键逻辑有注释，边界情况已考虑
