import { createServer } from "http";

const server = createServer((req, res) => {
  // SSE 端点
  if (req.url === "/events" && req.method === "GET") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
    });

    let id = 0;

    // 定时发送事件
    const interval = setInterval(() => {
      const data = {
        message: `消息 #${id}`,
        timestamp: new Date().toISOString(),
      };
      res.write(`id: ${id}\n`);
      res.write(`event: message\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
      id++;
    }, 1000);

    // 心跳保活
    const heartbeat = setInterval(() => {
      res.write(": heartbeat\n\n");
    }, 5_000);

    // 10 秒后主动结束：发送 [DONE] 标记通知客户端关闭连接
    setTimeout(() => {
      res.write("data: [DONE]\n\n");
      res.end();
      clearInterval(interval);
      clearInterval(heartbeat);
    }, 10_000);

    // 客户端断开时清理资源
    req.on("close", () => {
      clearInterval(interval);
      clearInterval(heartbeat);
    });
  } else {
    res.writeHead(404);
    res.end("Not Found");
  }
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`SSE 服务端运行在 http://localhost:${PORT}`);
  console.log(`SSE 端点: http://localhost:${PORT}/events`);
});
