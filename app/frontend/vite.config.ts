import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import fs from 'node:fs';
import path from 'path';
import { viteSourceLocator } from '@metagptx/vite-plugin-source-locator';
import { atoms } from '@metagptx/web-sdk/plugins';
import { vitePrerenderPlugin } from 'vite-prerender-plugin';
import Sitemap from 'vite-plugin-sitemap';
import { getBlogRoutes } from './prerender/blog-routes.js';
import { getSitemapLastmod } from './prerender/blog-sitemap.js';
import { reactHmrGuard } from './plugins/react-hmr-guard.js';
import { dedupeHeadTags } from './plugins/dedupe-head-tags.js';
import seoPages from './src/data/seo-pages.json';

// Public domain, e.g. https://example.com. A sitemap needs absolute URLs, so it
// is generated only when this is set.
const SITE_ORIGIN = (process.env.VITE_SITE_ORIGIN || '').replace(/\/$/, '');

/** Static routes plus every programmatic SEO landing page. */
function getSiteRoutes(): string[] {
  const staticRoutes = [
    '/',
    '/api-calculator',
    '/vram-calculator',
    '/directory',
    '/about',
    '/contact',
    '/privacy-policy',
    '/terms-of-service',
  ];
  const seoRoutes = (seoPages as { pages: { tool: string; slug: string }[] }).pages.map(
    (page) => `/${page.tool === 'vram' ? 'vram-calculator' : 'api-calculator'}/${page.slug}`,
  );
  return [...staticRoutes, ...seoRoutes];
}

function escapeHtmlAttr(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

process.env.VITE_APP_TITLE ??= process.env.OVERVIEW_TITLE ?? 'shadcnui';
process.env.VITE_APP_DESCRIPTION ??= process.env.OVERVIEW_DESCRIPTION ?? 'Atoms Generated Project';
process.env.VITE_APP_TITLE = escapeHtmlAttr(process.env.VITE_APP_TITLE);
process.env.VITE_APP_DESCRIPTION = escapeHtmlAttr(process.env.VITE_APP_DESCRIPTION);
process.env.VITE_APP_LOGO_URL ??= process.env.OVERVIEW_LOGO_URL ?? 'https://public-frontend-cos.metadl.com/mgx/img/favicon_atoms.ico';

function ensureBuildOutDir() {
  let outDir = path.resolve(__dirname, 'dist');

  return {
    name: 'ensure-build-out-dir',
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir);
    },
    writeBundle() {
      fs.mkdirSync(outDir, { recursive: true });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  const prerenderRoutes = command === 'build' ? [...getSiteRoutes(), ...getBlogRoutes()] : [];

  return {
    plugins: [
      viteSourceLocator({
        prefix: 'mgx', // Prefix used to identify source locations; do not change.
      }),
      reactHmrGuard(),
      react(),
      atoms(),
      ensureBuildOutDir(),
      ...(SITE_ORIGIN
        ? [
            Sitemap({
              hostname: SITE_ORIGIN,
              lastmod: getSitemapLastmod(),
              readable: true,
              generateRobotsTxt: false,
              dynamicRoutes: getSiteRoutes(),
            }),
          ]
        : []),
      ...(prerenderRoutes.length > 0
        ? vitePrerenderPlugin({
            renderTarget: '#root',
            prerenderScript: path.resolve(__dirname, 'prerender/app.js'),
            additionalPrerenderRoutes: prerenderRoutes,
          })
        : []),
      dedupeHeadTags(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      host: '0.0.0.0', // Listen on all network interfaces.
      port: parseInt(process.env.VITE_PORT || '3000'),
      proxy: {
        '/api': {
          target: `http://localhost:${process.env.BACKEND_PORT || '8000'}`,
          changeOrigin: true,
        },
      },
      watch: { usePolling: true, interval: 600 },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // Vendor chunks
            'react-vendor': ['react', 'react-dom'],
            'router-vendor': ['react-router-dom'],
            'ui-vendor': [
              '@radix-ui/react-accordion',
              '@radix-ui/react-alert-dialog',
              '@radix-ui/react-aspect-ratio',
              '@radix-ui/react-avatar',
              '@radix-ui/react-checkbox',
              '@radix-ui/react-collapsible',
              '@radix-ui/react-context-menu',
              '@radix-ui/react-dialog',
              '@radix-ui/react-dropdown-menu',
              '@radix-ui/react-hover-card',
              '@radix-ui/react-label',
              '@radix-ui/react-menubar',
              '@radix-ui/react-navigation-menu',
              '@radix-ui/react-popover',
              '@radix-ui/react-progress',
              '@radix-ui/react-radio-group',
              '@radix-ui/react-scroll-area',
              '@radix-ui/react-select',
              '@radix-ui/react-separator',
              '@radix-ui/react-slider',
              '@radix-ui/react-slot',
              '@radix-ui/react-switch',
              '@radix-ui/react-tabs',
              '@radix-ui/react-toast',
              '@radix-ui/react-toggle',
              '@radix-ui/react-toggle-group',
              '@radix-ui/react-tooltip',
            ],
            'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
            'utils-vendor': [
              'axios',
              'clsx',
              'tailwind-merge',
              'class-variance-authority',
              'date-fns',
              'lucide-react',
            ],
            'query-vendor': ['@tanstack/react-query'],
            // The pSEO dataset changes on its own cadence (regenerated by
            // scripts/generate-seo-pages.mjs), so keep it out of the app chunk
            // to preserve browser caching across code deploys.
            'seo-data': [path.resolve(__dirname, 'src/data/seo-pages.json')],
          },
        },
      },
      chunkSizeWarningLimit: 1000,
    },
  };
});
