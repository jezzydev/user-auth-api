import js from '@eslint/js';
import globals from 'globals';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
    // Recommended base rules
    js.configs.recommended,

    {
        files: ['**/*.js'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module', //commonjs
            globals: { ...globals.browser },
        },
        rules: {
            // Modern JS
            'no-var': 'error',
            'prefer-const': 'warn',
            'prefer-arrow-callback': 'warn',
            'prefer-template': 'warn',
            'object-shorthand': 'warn',
            'arrow-body-style': ['warn', 'as-needed'],

            // Browser specific
            'no-console': 'warn', // Warn about console in frontend
            'no-alert': 'warn', // Avoid alert()
            'no-eval': 'error',

            // Best practices
            eqeqeq: ['error', 'always'],
            curly: ['error', 'all'],
            'no-unused-vars': 'warn',
            'no-undef': 'error',
        },
    },
    {
        files: ['vite.config.js', 'eslint.config.mjs'],
        languageOptions: {
            globals: { ...globals.node },
        },
    },
    // Prettier (disables conflicting ESLint rules)
    eslintConfigPrettier,
];
