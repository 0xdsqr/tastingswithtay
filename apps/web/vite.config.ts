import tailwindcss from "@tailwindcss/vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import react from "@vitejs/plugin-react"
import { nitro } from "nitro/vite"
import { defineConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"

function manualChunks(id: string): string | undefined {
  if (id.includes("lucide-react")) return "vendor-icons"
  return undefined
}

export default defineConfig({
  build: {
    rollupOptions: {
      external: ["pg", "pg-native"],
      output: { manualChunks },
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
  },
  ssr: {
    external: ["pg", "pg-native"],
  },
  server: {
    port: 3010,
  },
})
