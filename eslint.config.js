const eslint = require("@eslint/js");
const prettier = require("eslint-config-prettier");
const prettierPlugin = require("eslint-plugin-prettier");
const jest = require("eslint-plugin-jest");

module.exports = [
  // Apply to all JavaScript files
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: {
        console: "readonly",
        process: "readonly",
        Buffer: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        require: "readonly",
        module: "readonly",
        exports: "readonly",
        global: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
      },
    },
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      ...eslint.configs.recommended.rules,
      ...prettier.rules,

      // Prettier integration
      "prettier/prettier": "error",

      // Additional rules for better code quality
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "no-console": "off", // We use console for CLI output
      "prefer-const": "error",
      "no-var": "error",
      curly: ["error", "all"],
      eqeqeq: ["error", "always"],
      "no-eval": "error",
      "no-implied-eval": "error",
    },
  },

  // Test file specific configuration
  {
    files: ["tests/**/*.js", "**/*.test.js", "**/*.spec.js"],
    plugins: {
      jest: jest,
      prettier: prettierPlugin,
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: {
        ...jest.environments.globals.globals,
        console: "readonly",
        process: "readonly",
        Buffer: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        require: "readonly",
        module: "readonly",
        exports: "readonly",
      },
    },
    rules: {
      ...eslint.configs.recommended.rules,
      ...prettier.rules,
      ...jest.configs.recommended.rules,

      "prettier/prettier": "error",
      "jest/expect-expect": "error",
      "jest/no-disabled-tests": "warn",
      "jest/no-focused-tests": "error",
      "jest/no-identical-title": "error",
      "jest/valid-expect": "error",
    },
  },

  // Ignore patterns
  {
    ignores: [
      "node_modules/",
      "coverage/",
      "var/",
      "logo-build/",
      ".leafstone-temp-*/",
      "examples/",
    ],
  },
];
