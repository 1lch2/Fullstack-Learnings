# WebSocket

> WebSocket 是一种在单个 TCP 连接上进行全双工通信的协议，解决了 HTTP 协议在实时通信场景下的局限性。

## WebSocket 概述

WebSocket 是 HTML5 开始提供的一种在单个 TCP 连接上进行全双工通讯的协议。WebSocket 通信协议于 2011 年被 IETF 定为标准 RFC 6455，WebSocket API 由 W3C 定为标准。

### 核心特性

- **全双工通信**：客户端和服务器可以同时发送和接收数据
- **低延迟**：建立连接后无需反复握手，减少通信开销
- **持久连接**：保持 TCP 连接打开，适合实时数据传输
- **轻量级头部**：数据帧头部仅 2-14 字节，远小于 HTTP 头部

## 为什么需要 WebSocket

### HTTP 轮询的局限性

在 WebSocket 出现之前，实时通信主要依赖以下 HTTP 方案：

| 方案               | 原理                     | 缺点                           |
| ------------------ | ------------------------ | ------------------------------ |
| 短轮询             | 客户端定时发送 HTTP 请求 | 大量无效请求，浪费带宽         |
| 长轮询             | 服务器保持连接直到有数据 | 仍需反复建立连接，延迟较高     |
| Server-Sent Events | 服务器单向推送           | 仅支持服务器到客户端的单向通信 |

### WebSocket 的优势

WebSocket 建立在 HTTP 协议之上，通过一次握手升级连接，后续通信使用独立的 WebSocket 协议：

1. **真正的双向通信**：客户端和服务器地位对等
2. **减少网络开销**：连接建立后无需重复发送 HTTP 头部
3. **更好的实时性**：服务器可主动推送数据，无需客户端轮询

## WebSocket 协议

### 协议标识

- `ws://`：非加密的 WebSocket 连接
- `wss://`：加密的 WebSocket 连接（基于 TLS/SSL）

### 连接建立过程

WebSocket 连接通过 HTTP 升级握手建立：

```javascript
// 客户端发起握手请求
GET /chat HTTP/1.1
Host: server.example.com
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13

// 服务器响应握手
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
```

### 数据帧格式

WebSocket 数据帧包含以下关键字段：

- **FIN**：指示是否为消息的最后一帧
- **Opcode**：操作码（文本、二进制、关闭、Ping、Pong）
- **Mask**：客户端发送的数据必须掩码处理
- **Payload**：实际传输的数据

## WebSocket API

### 基本使用

```javascript
// 创建 WebSocket 连接
const ws = new WebSocket("ws://localhost:8080");

// 连接建立触发
ws.addEventListener("open", (event) => {
  console.log("WebSocket 连接已建立");
  ws.send("Hello Server!");
});

// 接收消息
ws.addEventListener("message", (event) => {
  console.log("收到消息:", event.data);
});

// 连接关闭触发
ws.addEventListener("close", (event) => {
  console.log("连接已关闭:", event.code, event.reason);
});

// 错误处理
ws.addEventListener("error", (error) => {
  console.error("WebSocket 错误:", error);
});
```

### 连接状态

WebSocket 对象的 `readyState` 属性表示连接状态：

- `WebSocket.CONNECTING (0)`：正在连接
- `WebSocket.OPEN (1)`：连接已建立，可通信
- `WebSocket.CLOSING (2)`：连接正在关闭
- `WebSocket.CLOSED (3)`：连接已关闭

### 发送数据

```javascript
// 发送文本数据
socket.send("Hello");

// 发送二进制数据
const buffer = new ArrayBuffer(16);
socket.send(buffer);

// 发送 JSON 数据
const data = { type: "message", content: "Hello" };
socket.send(JSON.stringify(data));
```

## 服务端实现

### Node.js 示例

```javascript
const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 8080 });

wss.on("connection", (ws) => {
  console.log("客户端已连接");

  // 接收消息
  ws.on("message", (message) => {
    console.log("收到消息:", message.toString());

    // 广播消息给所有客户端
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message.toString());
      }
    });
  });

  // 连接关闭
  ws.on("close", () => {
    console.log("客户端已断开");
  });

  // 发送欢迎消息
  ws.send("欢迎连接到 WebSocket 服务器");
});
```

### 连接管理

```javascript
// 心跳检测机制
function heartbeat() {
  this.isAlive = true;
}

wss.on("connection", (ws) => {
  ws.isAlive = true;
  ws.on("pong", heartbeat);

  // 定时检测连接状态
  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) return ws.terminate();
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  ws.on("close", () => {
    clearInterval(interval);
  });
});
```

## 实际应用场景

### 即时聊天应用

```javascript
// 聊天消息处理
ws.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);

  switch (message.type) {
    case "chat":
      displayMessage(message.content);
      break;
    case "userJoin":
      showNotification(`${message.user} 加入聊天`);
      break;
    case "userLeave":
      showNotification(`${message.user} 离开聊天`);
      break;
  }
});

// 发送聊天消息
function sendMessage(content) {
  const message = {
    type: "chat",
    content: content,
    timestamp: Date.now(),
  };
  socket.send(JSON.stringify(message));
}
```

### 实时数据推送

```javascript
// 股票行情订阅
function subscribeStock(stockCode) {
  const message = {
    type: "subscribe",
    stockCode: stockCode,
  };
  socket.send(JSON.stringify(message));
}

// 接收实时行情
socket.addEventListener("message", (event) => {
  const data = JSON.parse(event.data);
  if (data.type === "stockUpdate") {
    updateStockDisplay(data.stockCode, data.price);
  }
});
```

## 注意事项

### 心跳机制

保持连接活跃，防止代理服务器或防火墙断开空闲连接：

```javascript
// 客户端心跳
let heartbeatTimer;

function startHeartbeat() {
  heartbeatTimer = setInterval(() => {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: "ping" }));
    }
  }, 30000);
}

socket.addEventListener("open", startHeartbeat);
socket.addEventListener("close", () => {
  clearInterval(heartbeatTimer);
});
```

### 自动重连

网络不稳定时实现自动重连：

```javascript
class WebSocketClient {
  constructor(url) {
    this.url = url;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.connect();
  }

  connect() {
    this.socket = new WebSocket(this.url);

    this.socket.addEventListener("open", () => {
      console.log("连接成功");
      this.reconnectAttempts = 0;
    });

    this.socket.addEventListener("close", () => {
      this.attemptReconnect();
    });
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      console.log(`${delay}ms 后尝试第 ${this.reconnectAttempts} 次重连`);
      setTimeout(() => this.connect(), delay);
    }
  }
}
```

### 安全性考虑

1. **使用 wss://**：生产环境必须使用加密连接
2. **验证来源**：服务器应验证 `Origin` 头部
3. **输入验证**：对所有消息进行验证和过滤
4. **限制连接数**：防止单个客户端占用过多资源

## 面试常见问题

### WebSocket 与 HTTP 的区别

| 特性       | HTTP                   | WebSocket      |
| ---------- | ---------------------- | -------------- |
| 通信方式   | 半双工（请求-响应）    | 全双工         |
| 连接方式   | 短连接                 | 长连接         |
| 协议标识   | http:// / https://     | ws:// / wss:// |
| 服务器推送 | 不原生支持             | 原生支持       |
| 头部开销   | 每次请求都携带完整头部 | 握手后头部极小 |

### WebSocket 如何保证实时性

1. **持久连接**：避免反复建立 TCP 连接
2. **全双工通信**：服务器可主动推送
3. **轻量级协议**：数据帧头部小，传输效率高
4. **心跳机制**：保持连接活跃

### WebSocket 的应用场景

- 即时通讯（聊天室、客服系统）
- 实时数据推送（股票行情、体育比分）
- 在线游戏（多玩家同步）
- 协同编辑（文档协同编辑）
- 实时监控（系统监控、日志推送）

### WebSocket 的局限性

1. **代理兼容性**：部分代理服务器可能不支持 WebSocket
2. **负载均衡**：需要支持会话保持的负载均衡器
3. **连接管理**：需要处理连接断开和重连逻辑
4. **状态维护**：服务器需要维护大量持久连接

## 参考资料

- [RFC 6455 - The WebSocket Protocol](https://tools.ietf.org/html/rfc6455)
- [MDN WebSocket API](https://developer.mozilla.org/zh-CN/docs/Web/API/WebSocket)
- [WebSocket vs Server-Sent Events vs Long-Polling](https://www.baeldung.com/websockets-vs-sse-vs-long-polling)
