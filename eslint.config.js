import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import angular from '@angular-eslint/eslint-plugin';
import angularTemplateParser from '@angular-eslint/template-parser';
import angularTemplatePlugin from '@angular-eslint/eslint-plugin-template';

export default [
  js.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: './tsconfig.json',
      },
      globals: {
        console: 'readonly',
        alert: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        document: 'readonly',
        window: 'readonly',
        navigator: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        location: 'readonly',
        history: 'readonly',
        fetch: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
      '@angular-eslint': angular,
    },
    rules: {
      // TypeScript recommended rules
      ...typescript.configs.recommended.rules,

      // Angular recommended rules
      ...angular.configs.recommended.rules,

      // Custom rules for this project
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],
      '@typescript-eslint/no-deprecated': 'error',
      '@typescript-eslint/ban-ts-comment': 'error',
      '@typescript-eslint/no-require-imports': 'error',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-wrapper-object-types': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      'prefer-const': 'error',
      'no-unused-vars': 'off', // Turn off base rule as TypeScript version is used
      'no-console': 'warn',
      'no-debugger': 'error',
      'no-alert': 'warn',
      'no-eval': 'error',

      // Angular specific rules
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: 'app', style: 'camelCase' },
      ],
      '@angular-eslint/component-selector': [
        'error',
        { type: 'element', prefix: 'app', style: 'kebab-case' },
      ],
      '@angular-eslint/no-input-rename': 'error',
      '@angular-eslint/no-output-rename': 'error',
      '@angular-eslint/use-lifecycle-interface': 'error',
      '@angular-eslint/prefer-on-push-component-change-detection': 'warn',
    },
  },
  {
    // Template linting configuration
    files: ['**/*.html'],
    languageOptions: {
      parser: angularTemplateParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: './tsconfig.json',
      },
    },
    plugins: {
      '@angular-eslint/template': angularTemplatePlugin,
    },
    rules: {
      // Angular template recommended rules
      ...angularTemplatePlugin.configs.recommended.rules,

      // Additional template rules for better code quality
      '@angular-eslint/template/prefer-control-flow': 'error',
      '@angular-eslint/template/use-track-by-function': 'error',
      '@angular-eslint/template/no-duplicate-attributes': 'error',
      '@angular-eslint/template/no-nested-tags': 'error',
      '@angular-eslint/template/no-empty-control-flow': 'error',
      '@angular-eslint/template/no-interpolation-in-attributes': 'warn',
      '@angular-eslint/template/prefer-self-closing-tags': 'warn',
      '@angular-eslint/template/prefer-static-string-properties': 'warn',
      '@angular-eslint/template/attributes-order': 'warn',
      '@angular-eslint/template/eqeqeq': 'error',
      '@angular-eslint/template/banana-in-box': 'error',
      '@angular-eslint/template/no-negated-async': 'error',
      '@angular-eslint/template/no-call-expression': 'warn',
      '@angular-eslint/template/no-any': 'warn',
      '@angular-eslint/template/no-inline-styles': 'warn',
      '@angular-eslint/template/conditional-complexity': ['warn', { maxComplexity: 3 }],
      '@angular-eslint/template/cyclomatic-complexity': ['warn', { maxComplexity: 5 }],
    },
  },
  {
    // Ignore patterns
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/coverage/**',
      '**/*.config.js',
      '**/*.config.ts',
      '**/.angular/**',
    ],
  },
];