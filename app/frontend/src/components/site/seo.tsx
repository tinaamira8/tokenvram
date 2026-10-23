import { useEffect } from 'react';
import { SITE_ORIGIN } from '@/lib/site';

export interface FaqItem {
  q: string;
  a: string;
}

export interface SeoProps {
  title: string;
  description: string;
  /** Path only, e.g. "/api-calculator" */
  path: string;
  /** Emit SoftwareApplication JSON-LD for tool pages */
  application?: {
    name: string;
    description: string;
    category: string;
  };
  faq?: FaqItem[];
  /** Breadcrumb trail, last item is the current page */
  breadcrumbs?: { name: string; path: string }[];
}

export const SITE_NAME = 'Modelmath';
export const DEFAULT_ORIGIN = SITE_ORIGIN;

// ---------------------------------------------------------------------------
// Build-time capture
// ---------------------------------------------------------------------------

/**
 * During prerendering `renderToString` never runs effects, so `<Seo>` records
 * its props here instead. The build script reads them back and writes real head
 * tags into the static HTML — the same payloads the client would apply, so
 * there is a single source of truth.
 */
const capturedHead: SeoProps[] = [];

export function resetSeoCapture() {
  capturedHead.length = 0;
}

export function getSeoCapture(): SeoProps[] {
  return [...capturedHead];
}

// ---------------------------------------------------------------------------
// Head payload construction (shared by the client runtime and the build)
// ---------------------------------------------------------------------------

export interface MetaTag {
  attrs: Record<string, string>;
}

export function buildMetaTags({ title, description, path, origin }: { title: string; description: string; path: string; origin: string }) {
  const url = `${origin}${path}`;
  const tags: MetaTag[] = [
    { attrs: { name: 'description', content: description } },
    { attrs: { property: 'og:title', content: title } },
    { attrs: { property: 'og:description', content: description } },
    { attrs: { property: 'og:type', content: 'website' } },
    { attrs: { property: 'og:site_name', content: SITE_NAME } },
    { attrs: { name: 'twitter:card', content: 'summary_large_image' } },
    { attrs: { name: 'twitter:title', content: title } },
    { attrs: { name: 'twitter:description', content: description } },
  ];
  // Without a known public origin, an absolute og:url would be wrong; omit it.
  if (origin) tags.push({ attrs: { property: 'og:url', content: url } });
  return tags;
}

export interface StructuredDataInput {
  origin: string;
  path: string;
  application?: SeoProps['application'];
  faq?: FaqItem[];
  breadcrumbs?: SeoProps['breadcrumbs'];
}

/** schema.org graph shared by the client runtime and the build script. */
export function buildStructuredData({ origin, path, application, faq, breadcrumbs }: StructuredDataInput) {
  const url = `${origin}${path}`;
  const graph: Record<string, unknown>[] = [];

  if (application) {
    graph.push({
      '@type': 'SoftwareApplication',
      name: application.name,
      description: application.description,
      applicationCategory: application.category,
      operatingSystem: 'Any (web browser)',
      url,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      publisher: { '@type': 'Organization', name: SITE_NAME },
    });
  }

  if (faq && faq.length > 0) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: faq.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
    });
  }

  if (breadcrumbs && breadcrumbs.length > 0) {
    graph.push({
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.name,
        item: `${origin}${crumb.path}`,
      })),
    });
  }

  return graph.length > 0 ? { '@context': 'https://schema.org', '@graph': graph } : null;
}

// ---------------------------------------------------------------------------
// Client head manager
// ---------------------------------------------------------------------------

function upsertMeta(attrs: Record<string, string>) {
  const key = attrs.name ? `name="${attrs.name}"` : `property="${attrs.property}"`;
  const selector = `meta[${key}]`;
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attrs.name ? 'name' : 'property', attrs.name ?? attrs.property);
    document.head.appendChild(element);
  }
  if (attrs.content !== undefined) element.setAttribute('content', attrs.content);
}

/**
 * Client-side head manager: title, description, canonical, Open Graph,
 * Twitter card and JSON-LD structured data for the active route.
 */
export function Seo(props: SeoProps) {
  const { title, description, path, application, faq, breadcrumbs } = props;

  if (typeof window === 'undefined') capturedHead.push(props);

  useEffect(() => {
    const origin = window.location.origin || DEFAULT_ORIGIN;
    document.title = title;

    buildMetaTags({ title, description, path, origin }).forEach((tag) => upsertMeta(tag.attrs));

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', `${origin}${path}`);

    const graph = buildStructuredData({ origin, path, application, faq, breadcrumbs });
    const scriptId = 'modelmath-jsonld';
    document.getElementById(scriptId)?.remove();
    if (graph) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(graph);
      document.head.appendChild(script);
    }

    return () => {
      document.getElementById(scriptId)?.remove();
    };
    // Callers pass inline object/array literals; compare by serialised value so
    // the JSON-LD block is rebuilt only when the data actually changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, path, JSON.stringify(application), JSON.stringify(faq), JSON.stringify(breadcrumbs)]);

  return null;
}
