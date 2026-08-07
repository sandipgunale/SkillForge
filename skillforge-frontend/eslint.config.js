import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist"]),

  {
    files: ["**/*.{js,jsx}"],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],

    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },

    rules: {
      "react-refresh/only-export-components": [
        "warn",
        {
          allowConstantExport: true,
        },
      ],
    },
  },

  {
    files: ["src/components/ui/**", "src/routes/index.jsx"],
    rules: {
      // shadcn-style primitives export their cva variants beside the component,
      // and the router is a lazy-loaded route table — neither is Fast-Refresh
      // content, and the compiler rules do not apply without the React compiler.
      "react-refresh/only-export-components": "off",
    },
  },

  {
    files: ["**/*.{js,jsx}"],
    rules: {
      // react-hooks v7 ships React Compiler-aware checks (incompatible-library)
      // that are meaningless here: this project does not run the React
      // Compiler, so react-hook-form's watch() is not a hazard.
      "react-hooks/incompatible-library": "off",
    },
  },

  {
    files: ["vite.config.js"],
    languageOptions: {
      globals: globals.node,
    },
  },
]);