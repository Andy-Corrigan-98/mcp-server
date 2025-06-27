export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Type must be one of these
    'type-enum': [
      2,
      'always',
      [
        'build',    // Changes that affect the build system or external dependencies
        'chore',    // Other changes that don't modify src or test files
        'ci',       // Changes to CI configuration files and scripts
        'docs',     // Documentation only changes
        'feat',     // A new feature
        'fix',      // A bug fix
        'perf',     // A code change that improves performance
        'refactor', // A code change that neither fixes a bug nor adds a feature
        'revert',   // Reverts a previous commit
        'style',    // Changes that do not affect the meaning of the code
        'test',     // Adding missing tests or correcting existing tests
      ],
    ],
    // Subject must not be empty
    'subject-empty': [2, 'never'],
    // Subject must not end with period
    'subject-full-stop': [2, 'never', '.'],
    // Subject must be lowercase
    'subject-case': [2, 'always', ['lower-case']],
    // Header must not be longer than 72 characters
    'header-max-length': [2, 'always', 72],
    // Body must be wrapped at 72 characters
    'body-max-line-length': [2, 'always', 72],
    // Footer must be wrapped at 72 characters
    'footer-max-line-length': [2, 'always', 72],
  },
}; 