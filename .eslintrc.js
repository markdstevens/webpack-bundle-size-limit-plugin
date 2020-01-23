module.exports =  {
  parser:  '@typescript-eslint/parser',
  extends:  [
    'plugin:@typescript-eslint/recommended',
    'google',
    'plugin:prettier/recommended'
  ],
  parserOptions:  {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  rules: {
    'require-jsdoc' : 0,
    '@typescript-eslint/no-explicit-any': 0,
    '@typescript-eslint/no-var-requires': 0
  },
};