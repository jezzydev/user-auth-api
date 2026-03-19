import js from "@eslint/js";
import globals from "globals";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
    // Recommended base rules
    js.configs.recommended,

    // Your JavaScript files
    {
        files: ["**/*.js"],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "module", // You're using require/module.exports
            globals: {
                ...globals.node, // ✅ Node.js globals (require, module, __dirname, etc.)
            },
        },
        rules: {
            // Errors
            "no-unused-vars": [
                "warn",
                {
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                },
            ],
            "no-undef": "error",
            "no-var": "error", // Use let/const only
            "prefer-const": "warn", // Use const when possible

            // Node.js specific
            "no-console": "off", // Console OK in Node.js
            "no-process-exit": "warn", // Avoid process.exit()

            // Best practices
            eqeqeq: ["error", "always"], // Always use ===
            "no-eval": "error", // Never use eval
            "no-implied-eval": "error", // No setTimeout with strings
            curly: ["error", "all"], // Always use braces
            "dot-notation": "warn", // obj.prop not obj['prop']

            // Code quality
            "prefer-template": "warn", // Use template literals
            "prefer-arrow-callback": "warn", // Use arrow functions
            "no-throw-literal": "error", // Throw Error objects only
        },
    },

    // Prettier (disables conflicting ESLint rules)
    eslintConfigPrettier,
];
