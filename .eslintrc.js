const raw = require('@zhujianshi/lint/eslint-react');

module.exports = {
  ...raw,
  rules: {
    ...raw.rules,
    '@typescript-eslint/no-redeclare': 'off',
    '@typescript-eslint/no-unused-vars': 'warn',
  },
};
