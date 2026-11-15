'use strict';

const scopeUrl = new URL(self.registration.scope);
const shareTargetPath = new URL('share-target/', scopeUrl).pathname;

self.addEventListener('install', event => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

function escapeHtml(value) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function receiveShare(request) {
  const form = await request.formData();
  const parts = ['title', 'text', 'url']
    .map(key => form.get(key))
    .filter(value => typeof value === 'string')
    .map(value => value.trim())
    .filter(Boolean);
  const text = [...new Set(parts)].join('\n');
  const clipped = text.slice(0, 4000);
  const shell = await fetch(new URL('index.html', scopeUrl), { cache: 'no-store' });
  if (!shell.ok) return new Response('ScamSathi could not load the share screen.', { status: 503 });

  const baseTag = `<base href="${scopeUrl.href}">`;
  const inbox = `<textarea id="share-inbox" hidden data-truncated="${text.length > 4000}">${escapeHtml(clipped)}</textarea>`;
  let html = await shell.text();
  if (!html.includes('<head>') || !html.includes('<body>')) return new Response('Invalid ScamSathi app shell.', { status: 500 });
  html = html.replace('<head>', `<head>\n  ${baseTag}`).replace('<body>', `<body>\n  ${inbox}`);

  const headers = new Headers(shell.headers);
  headers.set('Content-Type', 'text/html; charset=utf-8');
  headers.set('Cache-Control', 'no-store');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Referrer-Policy', 'no-referrer');
  return new Response(html, { status: 200, headers });
}

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method === 'POST' && url.origin === scopeUrl.origin && url.pathname === shareTargetPath) {
    event.respondWith(receiveShare(event.request));
  }
});
