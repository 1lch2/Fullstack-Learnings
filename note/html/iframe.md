# HTML iframe

HTML 元素 `<iframe>` 表示嵌套的浏览上下文。它能够将另一个 HTML 页面嵌入到当前页面中。

## 导航

每个嵌入的浏览上下文都有自己的文档并且允许 URL 导航。

每个嵌入式浏览上下文的导航都会被线性嵌入到顶级浏览上下文的会话历史记录中。

> 这意味着：iframe 内部的每一次跳转，都会作为一条历史记录写入**父页面的会话历史**。浏览器的后退键会先回退 iframe 内部导航，而非直接离开当前页面。

### 微型示例：观察子页面导航如何影响父容器历史

以下示例用两个文件演示上述行为：子页面内的链接跳转会让父页面的 `history.length` 递增，父页面调用 `history.back()` 时，实际后退的是 iframe。

**`parent.html`（父页面）**

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <body>
    <h3>iframe 导航与父级历史记录</h3>

    <!-- 实时显示父页面历史栈长度，用于观察变化 -->
    <p>父页面 history.length = <span id="len">1</span></p>

    <!-- iframe 加载子页面；子页面内的链接导航会写入联合历史 -->
    <iframe id="frame" src="child.html" width="420" height="120"></iframe>

    <p>
      <!-- 调用的是父页面的 history.back()，但后退的会是 iframe -->
      <button onclick="history.back()">模拟浏览器后退</button>
    </p>

    <script>
      const len = document.getElementById("len");

      // iframe 每次完成导航（含内部跳转）都触发 load 事件（同源才生效）
      document.getElementById("frame").addEventListener("load", () => {
        // 子页面导航 → 父页面 history.length 递增
        len.textContent = history.length;
      });
    </script>
  </body>
</html>
```

**`child.html`（子页面）**

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <body style="background: #f4f4f4">
    <p>子页面：当前位置 = <span id="pos">初始</span></p>

    <!-- 链接导航：每一次点击都会写入父页面会话历史 -->
    <a href="child.html#a">跳到 A</a>
    <a href="child.html#b">跳到 B</a>
    <a href="child.html#c">跳到 C</a>

    <script>
      // 显示当前 hash，方便观察 iframe 是否发生了导航
      document.getElementById("pos").textContent = location.hash || "初始";
    </script>
  </body>
</html>
```

**操作步骤与现象**：

1. 打开 `parent.html`，记下 `history.length`（如 `2`）
2. 在 iframe 内点击「跳到 A」→ `history.length` 变为 `3`
3. 继续点击「跳到 B」→ `history.length` 变为 `4`
4. 点击「模拟浏览器后退」→ iframe 从 B 退回 A，**父页面纹丝不动**
5. 连续后退两次才会清空 iframe 的导航记录，再次后退才真正离开父页面

### 后退按钮陷阱（Back-Button Trap）

上述现象被称为后退按钮陷阱：用户在 iframe 中浏览若干页面后，本想点后退离开整个站点，浏览器却一直在 iframe 内部回退，导致用户"被困"。

规避手段：

| 手段                                         | 适用场景              | 说明                                            |
| -------------------------------------------- | --------------------- | ----------------------------------------------- |
| `location.replace(url)`                      | 同源 iframe           | 在子页面内用 `replace` 跳转，不产生新的历史记录 |
| `iframe.contentWindow.location.replace(url)` | 父页面控制同源 iframe | 父页面替换子页面地址，不污染历史                |
| 监听 `hashchange` + `pushState` 自管理       | SPA 嵌套              | 父页面接管路由，手动同步 iframe 状态            |

> 跨域 iframe 的 `contentWindow.history` 受同源策略限制，父页面无法读取或调用其方法，只能依赖子页面自身的配合（如通过 `postMessage` 通信）。

## 常用属性

| 属性               | 作用                       | 说明                                               |
| ------------------ | -------------------------- | -------------------------------------------------- |
| `src`              | 嵌入文档的地址             | 改变 `src` 会触发新的导航，并写入联合历史          |
| `srcdoc`           | 内联 HTML 作为 iframe 内容 | 无需额外文件，适合纯静态片段；优先级高于 `src`     |
| `name`             | 浏览上下文名称             | 可作为 `<a target="name">` 或 `window.open` 的目标 |
| `sandbox`          | 启用沙箱限制               | 见下表，需显式放开所需能力                         |
| `allow`            | 精细权限策略               | 如 `allow="camera; microphone"` 控制特性权限       |
| `loading`          | 加载策略                   | `lazy` 延迟加载，`eager` 立即加载（默认）          |
| `width` / `height` | 尺寸                       | 建议用 CSS 控制而非属性                            |
| `referrerpolicy`   | Referrer 策略              | 控制请求子文档时携带的 Referer                     |
| `title`            | 无障碍标题                 | 必填，供屏幕阅读器识别 iframe 用途                 |

### sandbox 关键字

未设置 `sandbox` 时，iframe 拥有完整能力；一旦设置，所有能力默认关闭，需逐项放开：

| 关键字                                    | 放开的能力                        |
| ----------------------------------------- | --------------------------------- |
| `allow-scripts`                           | 允许执行脚本                      |
| `allow-same-origin`                       | 维持源标识（否则源被置为 `null`） |
| `allow-forms`                             | 允许提交表单                      |
| `allow-popups`                            | 允许 `window.open`                |
| `allow-top-navigation`                    | 允许导航顶级窗口                  |
| `allow-top-navigation-by-user-activation` | 允许用户手势触发的顶级导航        |

> **安全提示**：同时设置 `allow-scripts` 与 `allow-same-origin` 时，子页面可读取并移除自身的 `sandbox` 属性，沙箱形同虚设。嵌入不可信内容时切勿组合使用。

## 经典场景

- **第三方内容嵌入**：地图（高德 / Google Maps）、视频（YouTube / B 站）、支付组件、社交插件，通过官方 iframe SDK 集成
- **不可信内容隔离**：富文本预览、用户自定义 HTML 渲染，借助 `sandbox` 限制脚本与同源访问
- **遗留系统集成**：将旧系统页面整体嵌入新框架外壳，渐进式迁移（参见 [微前端架构](../engineering/Micro_Frontend.md)）
- **微前端隔离方案**：iframe 提供天然 JS / CSS 隔离，是无界（wujie）等微前端框架的底层方案
- **文件预览**：PDF、Office 文档通过浏览器内置 viewer 直接预览
- **广告投放**：广告内容与宿主页面隔离，避免样式与脚本互相污染

## 注意事项

### 安全

| 风险                         | 应对                                                                                    |
| ---------------------------- | --------------------------------------------------------------------------------------- |
| **点击劫持（Clickjacking）** | 宿主页面通过 `X-Frame-Options: DENY` 或 CSP `frame-ancestors 'none'` 防止自身被恶意嵌套 |
| **子页面越权**               | 用 `sandbox` 收紧子页面能力，避免 `allow-top-navigation` 等高危项                       |
| **跨域数据泄露**             | 跨域 iframe 无法访问父页面 DOM，但仍可通过 `postMessage` 通信，需校验消息来源           |

### 性能与体验

- **懒加载**：非首屏 iframe 加 `loading="lazy"`，避免占用主线程与网络带宽
- **阻塞渲染**：iframe 的加载会阻塞父页面 `load` 事件，影响 LCP 指标
- **白屏闪烁**：切换 `src` 时先卸载旧文档再加载新文档，建议预加载或淡入过渡

### 无障碍与 SEO

- iframe 必须设置 `title` 属性，否则屏幕阅读器无法描述其用途
- 搜索引擎通常不索引 iframe 内容，关键内容不应仅存在于 iframe 中
- 跨域 iframe 的内容不计入父页面，无法被父页面的无障碍树直接读取

### 跨域限制

跨域 iframe 之间**无法**直接访问彼此的 DOM、`window` 属性或触发事件；通信只能依赖 `window.postMessage`：

```javascript
// 父页面 → 子页面
const frame = document.querySelector("iframe");
frame.contentWindow.postMessage({ type: "ping" }, "https://child.example.com");

// 子页面接收（需校验 origin，防止恶意页面发消息）
window.addEventListener("message", (e) => {
  if (e.origin !== "https://parent.example.com") return;
  console.log("收到：", e.data);
});
```

## 参考

- [`<iframe>` — MDN Web Docs](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/iframe)
- [Navigation and session history — HTML Standard](https://html.spec.whatwg.org/multipage/browsing-the-web.html)
- [Play safely in sandboxed iframes — web.dev](https://web.dev/articles/sandboxed-iframes)
- [Window: postMessage() — MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/postMessage)
