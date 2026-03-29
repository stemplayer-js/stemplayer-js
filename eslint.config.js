import openWcConfig from '@open-wc/eslint-config';
import prettierConfig from 'eslint-config-prettier';

export default [
  {
    ignores: [
      'node_modules/**',
      'coverage/**',
      'dist/**',
      'out-tsc/**',
      '_site/**',
      '.tmp/**',
      'storybook-static/**',
      'custom-elements.json',
    ],
  },

  ...openWcConfig,

  // Disable prettier-conflicting rules and apply project-specific overrides
  {
    rules: {
      ...prettierConfig.rules,
      'no-param-reassign': ['error', { props: false }],
    },
  },
];
