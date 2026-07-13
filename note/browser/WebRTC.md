# WebRTC

WebRTC (Web Real-Time Communication) 是一项开源技术和一套 W3C 标准，它允许网页浏览器和移动端设备之间进行点对点 (Peer-to-Peer, P2P) 的实时通信。

典型应用场景：视频会议（如 Google Meet）、在线教育、实时语音通话、P2P 大文件共享、云游戏等。

## 优势

浏览器在不需要安装任何第三方插件的情况下，直接捕获和传输音频、视频以及任意数据。

WebRTC 优先基于 UDP 协议传输数据（也会在必要时退化为 TCP），保证极低延迟。

## 代码示例

以建立视频和音频的实时流为例：

```ts
// 创建一个 P2P 连接
const pc = new RTCPeerConnection({
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
});

// 获取本地摄像头/麦克风
const stream = await navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true,
});

// 将媒体轨道加入连接
stream.getTracks().forEach((track) => pc.addTrack(track, stream));
```

## 和 WebSocket 的联系

WebRTC 和 WebSocket 是互补关系，常见于信令阶段

WebSocket是经典的 C/S 架构，客户端 A 发给客户端 B 的消息都必须先发送到中央服务器，由服务器转发。

而 WebRTC 是 P2P 架构，一旦连接建立，客户端 A 和 B 之间的数据是直接在两台设备之间传输的，不消耗服务器带宽。

| 维度               | WebRTC                | WebSocket           |
| ------------------ | --------------------- | ------------------- |
| 通信模型           | P2P（对等）           | Client-Server       |
| 传输内容           | 音视频流、DataChannel | 任意文本/二进制消息 |
| 传输协议           | UDP（优先）/TCP       | TCP                 |
| 在 WebRTC 中的角色 | 传输媒体数据          | 充当**信令通道**    |

## WebRTC 和 WebSocket 的协作

以 WebRTC 建立单向 P2P 视频流为例，经典场景为两个主机都没有公网IP，通过ISP的层层NAT获取IP。

这种情况首先需要公网部署的服务：

- 信令服务器（WebSocket 服务）：交换 SDP 和 ICE candidates
- STUN 服务器：帮双方发现自己的公网地址
- TURN 服务器（兜底）：当 P2P 无法穿透时中继媒体流

### STUN (Session Traversal Utilities for NAT)

STUN 是一个用于绕过 NAT（网络地址转换器）传递数据的辅助协议。STUN 会返回一台位于 NAT 背后的已接入网络的计算机的 IP 地址、端口和连通状态。

STUN 服务器通常部署在公网上，会将请求者的公网IP和端口发回去。但当NAT非常严格时，STUN也会失效，需要TURN服务器作为保底。

### ICE (Interactive Connectivity Establishment)

ICE（交互式连接建立）是一个允许你的浏览器和对端浏览器建立连接的协议框架。它不是一个单一的协议，而是一个机制框架。它的任务是收集所有可能的网络连接路径，并测试出哪条路最通畅。

这个协议让两端能够互相找到对方并建立一个连接，即便它们都使用了网络地址转译（NAT）去跟内网的其他设备共享同一个公网 IP 地址。

原理： ICE 会在后台默默收集一堆网络地址（称为 ICE Candidates / 候选者）。它通常会收集三种地址：

- Host 候选者： 你的局域网 IP（万一你们俩碰巧连着同一个 WiFi 呢，直接内网连最快）。
- Server Reflexive 候选者： 通过 STUN 获取到的公网 IP 和端口。
- Relay 候选者： 通过 TURN 服务器获取的中继地址（最慢，做备胎）。

一旦 ICE 收集到了这些“可能的联络方式”，它就需要把这些信息发给对方。后面就轮到 WebSocket 出场了。

### WebSocket：传递信令的通道

WebRTC 规定了音视频数据传输的方式，但没有规定双方如何发现。实践中通常使用 WebSocket 建立。

WebSocket 是目前最适合做信令的协议，因为它是双向实时的。在建立 P2P 视频之前，双方需要通过 WebSocket 服务器交换两样核心数据：

- SDP (Session Description Protocol - 会话描述协议)： 这是“设备名片”。里面包含了：我是谁、我要发视频还是音频、我支持 H.264 还是 VP8 编码、我的分辨率是多少等。
- ICE Candidates (网络候选者)： 这是“联络地址”。也就是上面 ICE 机制收集到的所有 IP 和端口。

### 过程推演

#### 第一阶段：准备与提议 (Offer)

1. 连上信使：前端浏览器通过 WebSocket 连接到信令服务器，发送一条业务指令：“请求观看直播流 101”。
2. 后端掏出“单向”名片：后端的媒体服务器（Media Server）收到请求，准备好对应的视频流。它调用底层的 WebRTC 引擎生成自己的 SDP（设备参数）。
   - 关键点：后端会在 SDP 中明确标注这条轨道是 `sendonly` （只负责发视频，不需要前端传递画面）。
   - 后端将这份 SDP 封装成一个 Offer 消息。
3. 信使跑腿：后端通过 WebSocket 把这个 Offer 发给前端。

#### 第二阶段：回应与寻找 (Answer & ICE)

4. 前端接受并回应： 前端浏览器收到后端的 Offer（知道了视频的编码格式等信息）。前端随即生成自己的 SDP。
   - 关键点： 既然是单向观看，前端在生成 SDP 时会标注自己为 `recvonly` （浏览器不会去请求用户的麦克风和摄像头权限）。
   - 前端将这份 SDP 封装成 Answer 消息，通过 WebSocket 发回给后端。
5. 探照灯启动：
   - 前端： 依然处在复杂的家庭网络或公司内网中，需要向公网上的 STUN 服务器发请求，获取自己的公网 IP。
   - 后端： 媒体服务器通常直接部署在拥有独立公网 IP 的云主机上，所以它“知道自己在哪”，不需要 STUN 探照灯，直接提供自己的公网 IP 即可。
6. 交换联络方式： 双方的 ICE 机制各自收集好地址（ICE Candidates）。前端通过 WebSocket 将自己的地址发给后端，后端也将自己的地址发给前端。

#### 第三阶段：打洞与连通 (P2P Connection)

7. 互相试探（NAT 打洞）：双方底层的 ICE 机制开始往对方提供的 IP 端口发送测试数据包（UDP ping）。因为后端的 IP 通常是完全公开的，所以这个打洞过程往往比两个普通用户之间快得多。
8. 握手成功： 一旦网络路径测试通畅，前端和后端之间的 WebRTC 通道正式建立。
9. 单向高速传输： 此时，后端开始把视频流的二进制数据直接通过 WebRTC 通道（底层 UDP）源源不断地“倒”给前端。
10. 前端渲染与功成身退： 前端代码拿到这条底层的 MediaStream 后，将其直接赋值给 React 组件中 `<video>` 标签的 `srcObject` 属性，画面出现。与此同时，WebSocket 信令通道完成使命，闲置下来。
