/** @type {import('@docusaurus/types').DocusaurusConfig} */
module.exports = {
  title: 'React Native IAP',
  tagline: 'Dinosaurs are cool',
  url: 'http://giovannicimolin.github.io',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'giovannicimolin',
  projectName: 'react-native-iap', 
  themeConfig: {
    navbar: {
      title: 'React Native IAP',
      items: [
        {
          type: 'doc',
          docId: 'intro',
          position: 'left',
          label: 'Documentation',
        },
        {
          href: 'https://github.com/dooboolab/react-native-iap',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
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
          ],
        },
      ],
      copyright: `This is an Open Source project using the MIT license. Documentation built with Docusaurus.`,
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl:
            'https://github.com/facebook/docusaurus/edit/master/website/',
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          editUrl:
            'https://github.com/facebook/docusaurus/edit/master/website/blog/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};
