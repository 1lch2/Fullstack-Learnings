import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 3001 });

let clientId = 0;

wss.on("connection", (ws) => {
  const id = ++clientId;
  console.log(`客户端 #${id} 已连接`);

  // 发送欢迎消息
  ws.send(
    JSON.stringify({
      type: "welcome",
      message: `欢迎，你的 ID 是 #${id}`,
      timestamp: new Date().toISOString(),
    }),
  );

  // 定时推送消息
  let msgId = 0;
  const interval = setInterval(() => {
    if (ws.readyState === ws.OPEN) {
      ws.send(
        JSON.stringify({
          type: "push",
          id: ++msgId,
          message: `服务端推送 #${msgId}`,
          timestamp: new Date().toISOString(),
        }),
      );
    }
  }, 1000);

  setTimeout(() => {
    clearInterval(interval);
  }, 10_000);

  // 回显客户端消息
  ws.on("message", (data) => {
    const text = data.toString();
    console.log(`客户端 #${id}:`, text);
    ws.send(
      JSON.stringify({
        type: "echo",
        message: `服务端已收到: ${text}`,
        timestamp: new Date().toISOString(),
      }),
    );
  });

  ws.on("close", () => {
    console.log(`客户端 #${id} 已断开`);
    clearInterval(interval);
  });
});

console.log(`WebSocket 服务端运行在 ws://localhost:3001`);
