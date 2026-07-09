import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1];
const rootDir = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  base: repoName ? `/${repoName}/` : "/",
  build: {
    rollupOptions: {
      input: {
        main: resolve(rootDir, "index.html"),
        v1: resolve(rootDir, "v1/index.html"),
      },
    },
  },
});
