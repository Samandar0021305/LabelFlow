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
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API', link: '/api/annotation-provider' },
      { text: 'Examples', link: '/examples/' },
      {
        text: 'v0.1.4',
        items: [
          { text: 'Changelog', link: '/changelog' },
          { text: 'npm', link: 'https://www.npmjs.com/package/@labelflow-core/react' },
        ],
      },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Installation', link: '/guide/installation' },
          ],
        },
        {
          text: 'Essentials',
          items: [
            { text: 'Drawing BBox', link: '/guide/drawing-bbox' },
            { text: 'Import & Export', link: '/guide/import-export' },
            { text: 'Color Control', link: '/guide/color-control' },
            { text: 'Canvas Sizing', link: '/guide/canvas-sizing' },
            { text: 'Zoom & Pan', link: '/guide/zoom-pan' },
          ],
        },
        {
          text: 'Framework Guides',
          items: [
            { text: 'React', link: '/guide/react' },
            { text: 'Vue 3', link: '/guide/vue' },
            { text: 'Vanilla JS', link: '/guide/vanilla-js' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'Components',
          items: [
            { text: 'AnnotationProvider', link: '/api/annotation-provider' },
            { text: 'AnnotationCanvas', link: '/api/annotation-canvas' },
          ],
        },
        {
          text: 'Hooks / Composables',
          items: [
            { text: 'useAnnotation()', link: '/api/use-annotation' },
          ],
        },
        {
          text: 'Core Engine',
          items: [
            { text: 'AnnotationEngine', link: '/api/annotation-engine' },
            { text: 'Canvas2DRenderer', link: '/api/canvas-renderer' },
          ],
        },
        {
          text: 'Types',
          items: [
            { text: 'BoundingBox', link: '/api/types' },
          ],
        },
      ],
      '/examples/': [
        {
          text: 'Examples',
          items: [
            { text: 'Overview', link: '/examples/' },
            { text: 'React Full App', link: '/examples/react-full' },
            { text: 'Vue Full App', link: '/examples/vue-full' },
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
