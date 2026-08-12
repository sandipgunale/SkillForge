import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },

  build: {
    modulePreload: {
      resolveDependencies: (_filename, deps) =>
        deps.filter((dep) => !/vendor-charts/.test(dep)),
    },
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: "vendor-react", test: /node_modules\/(react|react-dom|scheduler)\// },
            { name: "vendor-router", test: /node_modules\/react-router-dom\// },
            { name: "vendor-query", test: /node_modules\/@tanstack\// },
            { name: "vendor-forms", test: /node_modules\/(react-hook-form|zod|@hookform)\// },
            { name: "vendor-motion", test: /node_modules\/(framer-motion|gsap)\// },
            { name: "vendor-three", test: /node_modules\/(three|@react-three)\// },
            { name: "vendor-charts", test: /node_modules\/recharts\// },
            { name: "vendor-ui", test: /node_modules\/(@base-ui|class-variance-authority|clsx|tailwind-merge)\// },
            { name: "vendor-icons", test: /node_modules\/lucide-react\// },
          ],
        },
      },
    },
  },
});