/** Site-wide constants shared by pages, the SEO layer and the build. */

export const SUPPORT_EMAIL = 'helloweb717@gmail.com';

/**
 * Public origin of the published site, e.g. "https://example.com".
 * Set VITE_SITE_ORIGIN at build time once a domain exists. When empty, the
 * prerendered HTML omits absolute URLs (canonical, og:url) and the client
 * fills them in from window.location at runtime.
 */
/**
 * Ad slots render only once an AdSense client ID is configured
 * (VITE_ADSENSE_CLIENT=ca-pub-…). Until then they take no space, so reviewers
 * never see empty "Advertisement" boxes.
 */
export const ADS_ENABLED = Boolean(import.meta.env?.VITE_ADSENSE_CLIENT);

export const SITE_ORIGIN: string = (import.meta.env?.VITE_SITE_ORIGIN as string | undefined)?.replace(/\/$/, '') ?? '';
