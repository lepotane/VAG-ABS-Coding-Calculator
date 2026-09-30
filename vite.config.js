import { defineConfig } from "vite";

export default defineConfig({
  root: "src",
  base: "./",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    target: "es2022",
    assetsInlineLimit: 0,
  },
  server: { port: 5180, strictPort: false },
  test: {
    environment: "node",
    include: ["tests/**/*.test.js"],
    root: ".",
  },
});
