// eslint.config.cjs
const { FlatCompat } = require("@eslint/eslintrc");
const js = require("@eslint/js");
const path = require("path");

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

module.exports = [
  ...compat.extends(
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-native/all",
    "prettier"
  ),
  ...compat.env({
    es6: true,
    browser: true,
    "react-native/react-native": true,
  }),
  ...compat.plugins("@typescript-eslint", "react", "react-native"),
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    languageOptions: {
      parser: require("@typescript-eslint/parser"),
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    rules: {
      // your custom rules
    },
    settings: {
      react: { version: "detect" },
    },
  },
];
