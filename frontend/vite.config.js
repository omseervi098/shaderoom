import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig, loadEnv } from "vite";
import process from "process";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  return {
    plugins: [react(), tailwindcss()],
    esbuild: {
      drop: mode === "production" ? ["console", "debugger"] : [], // Removes console logs in production
    },
    assetsInclude: ["**/*.onnx", "**/*.wasm"],
    optimizeDeps: {
      exclude: ["onnxruntime-web"],
    },
    preview: {
      allowedHosts: [
        env.VITE_APP_HOSTNAME || "localhost"
      ]
    }
  };
});
