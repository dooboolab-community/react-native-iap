/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'React Native IAP',
  tagline: 'React Native In App Purchase',
  url: 'https://react-native-iap.dooboolab.com',
  baseUrl: '/',
  favicon: 'img/favicon.ico',
  organizationName: 'dooboolab',
  projectName: 'react-native-iap',
  /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
  themeConfig: {
    colorMode: {
      defaultMode: 'dark',
    },
    navbar: {
      title: 'React Native IAP',
      logo: {
        alt: 'react native iap',
        src: 'img/logo.png',
      },
      items: [
        {
          href: 'https://github.com/dooboolab/react-native-iap',
          position: 'right',
          className: 'header-github-link',
          'aria-label': 'GitHub repository',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Learn',
          items: [
            {
              label: 'Get started',
              to: 'https://react-native-iap.dooboolab.com/docs/get-started',
            },
            {
              label: 'Installation',
              to: 'https://react-native-iap.dooboolab.com/docs/installation',
            },
          ],
        },
        {
          title: 'GitHub',
          items: [
            {
              label: 'Issues',
              to: 'https://github.com/dooboolab/react-native-iap/issues',
            },
            {
              label: 'Discussions',
              to: 'https://github.com/dooboolab/react-native-iap/discussions',
            },
            {
              label: 'Pull requests',
              to: 'https://github.com/dooboolab/react-native-iap/pulls',
            },
            {
              label: 'Changelog',
              to: 'https://github.com/dooboolab/react-native-iap/releases',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Open Collective',
              to: 'https://opencollective.com/react-native-iap',
            },
            {
              label: 'Slack',
              to: 'https://dooboolab.com/joinSlack',
            },
          ],
        },
      ],
      copyright: 'React Native IAP is under MIT license.',
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl:
            'https://github.com/dooboolab/react-native-iap/edit/main/docs/',
          remarkPlugins: [
            [require('@docusaurus/remark-plugin-npm2yarn'), {sync: true}],
          ],
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
  onBrokenLinks: 'log',
  onBrokenMarkdownLinks: 'log',
};

module.exports = config;
