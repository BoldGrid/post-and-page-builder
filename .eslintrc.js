// http://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parser: '@babel/eslint-parser',
  parserOptions: {
    sourceType: 'module'
  },
  env: {
    browser: true
  },
  // https://github.com/feross/standard/blob/master/RULES.md#javascript-standard-style
  // The plain "recommended" preset adds Prettier, which strips the parens spacing required below.
  extends: [ "plugin:@wordpress/eslint-plugin/recommended-with-formatting" ],
  plugins: [
    'html'
  ],
  // Add your custom rules here
  'rules': {
	'space-in-parens': ['error', 'always'],
	"wrap-iife": [2, "any"],
    // Removed from eslint-plugin-jsdoc (pinned by "resolutions"); @wordpress/eslint-plugin 14 still enables it.
    'jsdoc/newline-after-description': 0,
    // Allow async-await
    'generator-star-spacing': 0,
    // Allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0
  },
  overrides: [
    {
      files: [ 'tests/playwright/**/*.js' ],
      env: { node: true, browser: true, jquery: true },
      parserOptions: { sourceType: 'script', ecmaVersion: 2022 },
      rules: {
        // Playwright is a devDependency; the WordPress preset only allows dependencies.
        'import/no-extraneous-dependencies': 0
      }
    }
  ]
};
