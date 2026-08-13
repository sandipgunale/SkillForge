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
    /* vendor-three (three.js + @react-three/fiber) minifies to ~880 kB and
       can never fit the default 500 kB heuristic — three's core alone is
       ~700 kB. It is ONLY reachable through lazy-loaded 3D routes (auth
       scenes, dashboard orb, the landing cap scene), never the landing or
       dashboard critical path, and gzips to ~234 kB. The limit sits just
       above that chunk so regressions in any OTHER chunk still surface. */
    chunkSizeWarningLimit: 900,
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