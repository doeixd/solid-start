import { defineConfig } from "@solidjs/start/config";

export default defineConfig({
  start: {
    ssr: true,
    serverPlugins: ["./src/middleware.ts"]
  }
});