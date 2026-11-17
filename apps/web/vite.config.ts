import tailwindcss from "@tailwindcss/vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import react from "@vitejs/plugin-react"
import { nitro } from "nitro/vite"
import { defineConfig } from "vite"

export default defineConfig({
  build: {
    rollupOptions: {
      external: ["pg", "pg-native"],
    },
  },
  plugins: [tanstackStart(), react(), tailwindcss(), nitro({ preset: "node-server" })],
  resolve: {
    tsconfigPaths: true,
  },
  nitro: {
    preset: "node-server",
    rollupConfig: {
      external: ["pg", "pg-native"],
    },
  },
  ssr: {
    external: ["pg", "pg-native"],
  },
  server: {
    port: 3010,
  },
})
