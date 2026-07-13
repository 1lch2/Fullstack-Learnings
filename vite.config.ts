import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  // React 应用入口位于 src/react，将其作为 Vite 的 root
  root: "src/react",
  plugins: [react()],
});