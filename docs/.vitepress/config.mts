import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'LabelFlow',
  description: 'Image annotation library for React, Vue, and vanilla JavaScript',
  base: process.env.NETLIFY ? '/' : '/LabelFlow/',

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
  ],

  themeConfig: {
    logo: '/logo.svg',

    nav: [
      { text: 'Docs', link: '/docs/getting-started' },
      { text: 'Examples', link: '/examples/' },
      {
        text: 'v0.2.0',
        items: [
          { text: 'Changelog', link: '/changelog' },
          { text: 'npm', link: 'https://www.npmjs.com/package/@labelflow-core/react' },
        ],
      },
    ],

    sidebar: {
      '/docs/': [
        {
          text: 'Introduction',
          items: [
            { text: 'Getting Started', link: '/docs/getting-started' },
            { text: 'Installation', link: '/docs/installation' },
          ],
        },
        {
          text: 'Features',
          items: [
            { text: 'Drawing (BBox & Polygon)', link: '/docs/drawing' },
            { text: 'Import & Export', link: '/docs/import-export' },
            { text: 'Color Control', link: '/docs/color-control' },
            { text: 'Canvas Sizing', link: '/docs/canvas-sizing' },
            { text: 'Zoom & Pan', link: '/docs/zoom-pan' },
          ],
        },
        {
          text: 'API',
          items: [
            { text: 'AnnotationProvider', link: '/docs/annotation-provider' },
            { text: 'AnnotationCanvas', link: '/docs/annotation-canvas' },
            { text: 'useAnnotation()', link: '/docs/use-annotation' },
            { text: 'AnnotationEngine', link: '/docs/annotation-engine' },
            { text: 'Types', link: '/docs/types' },
          ],
        },
      ],
      '/examples/': [
        {
          text: 'Examples',
          items: [
            { text: 'Overview', link: '/examples/' },
            { text: 'React', link: '/examples/react' },
            { text: 'Vue', link: '/examples/vue' },
            { text: 'Vanilla JS', link: '/examples/vanilla-js' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/Samandar0021305/LabelFlow' },
      { icon: 'npm', link: 'https://www.npmjs.com/org/labelflow-core' },
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright 2026-present',
    },

    search: {
      provider: 'local',
    },

    editLink: {
      pattern: 'https://github.com/Samandar0021305/LabelFlow/edit/main/docs/:path',
      text: 'Edit this page on GitHub',
    },
  },
})
