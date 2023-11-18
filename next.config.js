const withNextra = require('nextra')({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx',
  compiler: {
    styledComponents: true,
  }
})

module.exports = withNextra()
