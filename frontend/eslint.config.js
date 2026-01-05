// ============================================================
// ESLINT CONFIG - WGeasy Frontend
// Sistema WG Easy - Grupo WG Almeida
// ============================================================
// Configuracao com regras strict para TypeScript
// ============================================================

import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';

export default [
  js.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        FormData: 'readonly',
        File: 'readonly',
        Blob: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        AbortController: 'readonly',
        Response: 'readonly',
        Request: 'readonly',
        Headers: 'readonly',
        Image: 'readonly',
        HTMLElement: 'readonly',
        HTMLInputElement: 'readonly',
        HTMLSelectElement: 'readonly',
        HTMLTextAreaElement: 'readonly',
        HTMLDivElement: 'readonly',
        Event: 'readonly',
        MouseEvent: 'readonly',
        KeyboardEvent: 'readonly',
        CustomEvent: 'readonly',
        FileReader: 'readonly',
        WebSocket: 'readonly',
        Worker: 'readonly',
        Notification: 'readonly',
        alert: 'readonly',
        confirm: 'readonly',
        prompt: 'readonly',
        atob: 'readonly',
        btoa: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
        IntersectionObserver: 'readonly',
        ResizeObserver: 'readonly',
        MutationObserver: 'readonly',
        performance: 'readonly',
        location: 'readonly',
        history: 'readonly',
        crypto: 'readonly',
        Intl: 'readonly',
        Promise: 'readonly',
        Map: 'readonly',
        Set: 'readonly',
        WeakMap: 'readonly',
        WeakSet: 'readonly',
        Symbol: 'readonly',
        Proxy: 'readonly',
        Reflect: 'readonly',
        Array: 'readonly',
        Object: 'readonly',
        String: 'readonly',
        Number: 'readonly',
        Boolean: 'readonly',
        Date: 'readonly',
        Math: 'readonly',
        JSON: 'readonly',
        RegExp: 'readonly',
        Error: 'readonly',
        TypeError: 'readonly',
        RangeError: 'readonly',
        SyntaxError: 'readonly',
        EvalError: 'readonly',
        ReferenceError: 'readonly',
        URIError: 'readonly',
        encodeURIComponent: 'readonly',
        decodeURIComponent: 'readonly',
        encodeURI: 'readonly',
        decodeURI: 'readonly',
        parseInt: 'readonly',
        parseFloat: 'readonly',
        isNaN: 'readonly',
        isFinite: 'readonly',
        undefined: 'readonly',
        NaN: 'readonly',
        Infinity: 'readonly',
        globalThis: 'readonly',
        structuredClone: 'readonly',
        queueMicrotask: 'readonly',
        TextEncoder: 'readonly',
        TextDecoder: 'readonly',
        DOMParser: 'readonly',
        XMLSerializer: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      'react': reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      // ==================== TypeScript Strict Rules ====================

      // Proibir uso de 'any' - AVISO por enquanto para facilitar transicao
      '@typescript-eslint/no-explicit-any': 'warn',

      // Exigir tipos de retorno explicitos em funcoes exportadas
      '@typescript-eslint/explicit-function-return-type': 'off',

      // Exigir tipos de retorno em funcoes publicas de modulo
      '@typescript-eslint/explicit-module-boundary-types': 'off',

      // Proibir variaveis nao utilizadas
      '@typescript-eslint/no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        ignoreRestSiblings: true,
      }],

      // Proibir tipos inferidos em expressoes
      '@typescript-eslint/no-inferrable-types': 'off',

      // ==================== React Rules ====================

      // Verificar regras de hooks
      'react-hooks/rules-of-hooks': 'error',

      // Verificar dependencias de useEffect/useCallback/useMemo
      'react-hooks/exhaustive-deps': 'warn',

      // React em escopo (nao necessario com React 17+)
      'react/react-in-jsx-scope': 'off',

      // Props types (nao necessario com TypeScript)
      'react/prop-types': 'off',

      // ==================== General Rules ====================

      // Permitir console.log em desenvolvimento (sera removido em producao pelo bundler)
      'no-console': 'off',

      // Proibir debugger
      'no-debugger': 'warn',

      // Proibir variaveis nao utilizadas (desabilitado em favor do typescript-eslint)
      'no-unused-vars': 'off',

      // Proibir atribuicao em expressoes condicionais
      'no-cond-assign': 'error',

      // Proibir uso de eval
      'no-eval': 'error',

      // Proibir with
      'no-with': 'error',

      // Exigir uso de === e !==
      'eqeqeq': ['warn', 'smart'],

      // Proibir funcoes dentro de loops
      'no-loop-func': 'warn',

      // Proibir reatribuicao de parametros de funcao
      'no-param-reassign': 'off',

      // Permitir underscore dangle
      'no-underscore-dangle': 'off',

      // Proibir reassign de variaveis import
      'no-import-assign': 'error',
    },
  },
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      '*.config.js',
      '*.config.ts',
      'vite.config.ts',
      'tailwind.config.js',
      'postcss.config.js',
    ],
  },
];
