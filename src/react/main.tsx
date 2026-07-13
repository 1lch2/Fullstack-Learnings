import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Modal } from "./components/Modal/Modal";

// React 开发入口：替换下方组件即可调试任意 src/react 下的实现
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Modal title="示例 Modal" />
  </StrictMode>,
);
