import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/euclidean_rhythm_generator/",
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
});
