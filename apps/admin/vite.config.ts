import tailwindcss from "@tailwindcss/vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import react from "@vitejs/plugin-react"
import { nitro } from "nitro/vite"
import { defineConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
  build: {
    rollupOptions: {
      external: ["pg", "pg-native"],
    },
  },
  plugins: [
    tanstackStart(),
    react(),
    tailwindcss(),
    tsconfigPaths(),
    nitro({ preset: "node-server" }),
  ],
  nitro: {
    preset: "node-server",
    rollupConfig: {
      external: ["pg", "pg-native"],
    },
    traceDeps: ["sharp*", "@img/sharp-wasm32*"],
  },
  ssr: {
    external: ["pg", "pg-native"],
  },
  server: {
    port: 3011,
  },
})
