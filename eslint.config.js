const eslintPluginJest = require("eslint-plugin-jest");
const eslintPluginImport = require("eslint-plugin-import");
const eslintPluginN = require("eslint-plugin-n");
const eslintPluginPromise = require("eslint-plugin-promise");
const eslintConfigStandard = require("eslint-config-standard");
const recommendedConfig = require("@eslint/js").configs.recommended;
const babelParser = require("@babel/eslint-parser"); // Require the parser directly

module.exports = [
  recommendedConfig,
  {
    files: ["src/**/*.js", "test/**/*.js"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      globals: {
        ...eslintPluginJest.environments.globals.globals,
        browser: true,
        node: true,
        process: true, // Explicitly define process for Node.js
        console: true, // Explicitly define console for Node.js
      },
      parser: babelParser, // Use the imported parser object
      parserOptions: {
        requireConfigFile: false, // No separate Babel config needed
        babelOptions: {
          plugins: ["@babel/plugin-transform-class-properties"], // Support class fields
        },
      },
    },
    plugins: {
      jest: eslintPluginJest,
      import: eslintPluginImport,
      n: eslintPluginN,
      promise: eslintPluginPromise,
    },
    rules: {
      ...eslintConfigStandard.rules,
      ...eslintPluginJest.configs.recommended.rules,
      "max-len": "off",
      curly: ["error"],
      "linebreak-style": ["error", "unix"],
      semi: ["error", "always"],
      "comma-dangle": ["off"],
      "no-unused-vars": [
        "error",
        { vars: "all", args: "none", ignoreRestSiblings: true },
      ],
      "no-console": ["off"], // Allow console usage
      "object-curly-spacing": ["error", "always"],
      "keyword-spacing": ["error"],
      "jest/no-disabled-tests": "warn",
      "jest/no-focused-tests": "error",
      "jest/no-identical-title": "error",
      "jest/valid-expect": "error",
    },
  },
];
