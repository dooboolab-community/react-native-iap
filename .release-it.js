module.exports = {
  git: {
    commitMessage: 'chore: release ${version}',
    tagName: 'v${version}',
  },
  npm: {
    publish: true,
  },
  github: {
    release: true,
  },
  plugins: {
    '@release-it/conventional-changelog': {
      preset: {
        name: 'conventionalcommits',
        types: [
          {
            type: 'feat',
            section: '✨ Features',
          },
          {
            type: 'fix',
            section: '🐛 Bug fixes',
          },
          {
            type: 'chore',
            section: '🛠️ Misc chores',
          },
          {
            type: 'docs',
            section: '📚 Documentation',
          },
          {
            type: 'refactor',
            section: '🚧 Refactoring',
          },
        ],
      },
    },
  },
};
