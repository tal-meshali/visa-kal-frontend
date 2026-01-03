import js from "@eslint/js";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    plugins: { js },
    extends: [
      "js/recommended",
      "eslint:recommended",
      "plugin:@typescript-eslint/recommended",
      "plugin:import/errors",
      "plugin:import/warnings",
      "plugin:import/typescript",
    ],
    languageOptions: { globals: globals.browser },
    rules: {
      "import/no-cycle": ["error", { ignoreExternal: true }],
    },
  },
  tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
]);
