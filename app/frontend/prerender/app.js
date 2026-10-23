/**
 * Build-time prerender script for every public route.
 *
 * Handles two families of routes:
 *   - /blog/*  → the SEO article shell (static HTML, no hydration)
 *   - everything else → the full application shell (header, page, footer)
 *
 * The `<Seo>` component records its props during `renderToString` (effects never
 * run on the server), and this script turns that record into real <title>,
 * meta, canonical and JSON-LD tags in the emitted HTML.
 */
import React from 'react';
import { renderToString } from 'react-dom/server';
import { Route, Routes } from 'react-router-dom';
import { StaticRouter } from 'react-router-dom/server';
import { AppRoutes } from '../src/App';
import BlogRoutes from '../src/blog-routes';
import { getBlogPost } from '../src/lib/blog';
import { SiteFooter, SiteHeader } from '../src/components/site/site-chrome';
import { ThemeProvider } from '../src/components/site/theme-provider';
import {
  buildMetaTags,
  buildStructuredData,
  getSeoCapture,
  resetSeoCapture,
} from '../src/components/site/seo';

// Set VITE_SITE_ORIGIN at build time once the site has a domain. Without it,
// no absolute canonical/og:url is baked in; the client fills them at runtime.
const ORIGIN = (process.env.VITE_SITE_ORIGIN || '').replace(/\/$/, '');

function renderApp(url) {
  resetSeoCapture();
  const html = renderToString(
    React.createElement(
      StaticRouter,
      { location: url },
      React.createElement(
        ThemeProvider,
        null,
        React.createElement(
          'div',
          { className: 'flex min-h-screen flex-col' },
          React.createElement(SiteHeader, null),
          React.createElement(
            'main',
            { id: 'main', className: 'flex-1' },
            React.createElement(AppRoutes),
          ),
          React.createElement(SiteFooter, null),
        ),
      ),
    ),
  );
  return { html, seo: getSeoCapture() };
}

function renderBlog(url) {
  const html = renderToString(
    React.createElement(
      StaticRouter,
      { location: url },
      React.createElement(Routes, null, React.createElement(Route, { path: '/blog/*', element: React.createElement(BlogRoutes) })),
    ),
  );

  const slug = url
    .replace(/^\/blog\/?/, '')
    .replace(/\/+$/, '')
    .replace(/^\/+/, '');
  const post = slug ? getBlogPost(slug) : null;

  const seo = [
    {
      title: slug && post ? `${post.title}` : 'Blog — Modelmath',
      description: post?.description ?? 'Guides on LLM API pricing, local inference hardware and quantization.',
      path: url,
    },
  ];

  return { html, seo, statusCode: slug && !post ? 404 : undefined };
}

function buildHead(seo) {
  // The last <Seo> rendered wins: nested pages mount before their layout shell.
  const primary = seo[seo.length - 1];
  if (!primary) return undefined;

  const elements = [
    {
      type: 'meta',
      props: {
        name: 'prerender-static-page',
        content: primary.path?.startsWith('/blog') ? 'blog' : 'app',
      },
    },
  ];

  buildMetaTags({ ...primary, origin: ORIGIN }).forEach((tag) => {
    elements.push({ type: 'meta', props: tag.attrs });
  });

  if (ORIGIN) elements.push({ type: 'link', props: { rel: 'canonical', href: `${ORIGIN}${primary.path}` } });

  const graph = buildStructuredData({ ...primary, origin: ORIGIN });
  if (graph) {
    elements.push({
      type: 'script',
      props: { type: 'application/ld+json' },
      children: JSON.stringify(graph),
    });
  }

  return {
    title: primary.title,
    lang: 'en',
    elements: new Set(elements),
  };
}

export async function prerender({ url }) {
  const result = url.startsWith('/blog') ? renderBlog(url) : renderApp(url);

  return {
    html: result.html,
    head: buildHead(result.seo),
    ...(result.statusCode ? { statusCode: result.statusCode } : {}),
  };
}
