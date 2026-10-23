import fs from 'node:fs';
import path from 'node:path';

/**
 * The HTML template ships overview-managed meta tags (title, description,
 * og:*, twitter:*), and the prerender plugin appends route-specific tags on
 * top. That leaves every prerendered page with two descriptions and two
 * Open Graph titles, which is ambiguous for crawlers and social cards.
 *
 * This plugin runs after prerendering and keeps only the last tag per
 * `name`/`property` key — the prerendered one — while leaving tags that have no
 * duplicate (viewport, charset, author, icons) untouched.
 */

function attributeValue(tag, attribute) {
  const match = tag.match(new RegExp(`${attribute}="([^"]*)"`));
  return match ? match[1] : null;
}

function dedupeHead(html) {
  const headEnd = html.indexOf('</head>');
  if (headEnd === -1) return html;
  const headStart = html.lastIndexOf('<head', headEnd);
  if (headStart === -1) return html;
  const headOpenEnd = html.indexOf('>', headStart) + 1;

  const head = html.slice(headOpenEnd, headEnd);
  const metaPattern = /<meta\b[^>]*>/g;
  const metas = head.match(metaPattern) ?? [];
  if (metas.length === 0) return html;

  const lastIndexByKey = new Map();
  metas.forEach((tag, index) => {
    const key = attributeValue(tag, 'name') ?? attributeValue(tag, 'property');
    if (key) lastIndexByKey.set(key, index);
  });

  let index = -1;
  const deduped = head.replace(metaPattern, (tag) => {
    index += 1;
    const key = attributeValue(tag, 'name') ?? attributeValue(tag, 'property');
    if (key && lastIndexByKey.get(key) !== index) return '';
    return tag;
  });

  const cleaned = deduped.replace(/[ \t]+\n/g, '\n');
  return html.slice(0, headOpenEnd) + cleaned + html.slice(headEnd);
}

function collectHtmlFiles(dir, bucket = []) {
  if (!fs.existsSync(dir)) return bucket;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) collectHtmlFiles(fullPath, bucket);
    else if (entry.isFile() && entry.name.endsWith('.html')) bucket.push(fullPath);
  }
  return bucket;
}

export function dedupeHeadTags() {
  let outDir = 'dist';

  return {
    name: 'modelmath:dedupe-head-tags',
    apply: 'build',
    enforce: 'post',
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir);
    },
    closeBundle() {
      const files = collectHtmlFiles(outDir);
      let changed = 0;
      for (const file of files) {
        const original = fs.readFileSync(file, 'utf8');
        const next = dedupeHead(original);
        if (next !== original) {
          fs.writeFileSync(file, next);
          changed += 1;
        }
      }
      if (changed > 0) {
        console.log(`Deduped head tags in ${changed} prerendered HTML file(s).`);
      }
    },
  };
}
