import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { Readable } from 'stream';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

const ENVELOPE_ID = '1zaZ2nIJZOj2RrS4ImbTrolJtmqeLhxGJ';

// STRICT SEPARATION:
// FIRST IMAGE (preview): 1OtdbFTZBXfn0NLCikorJQHlL74MpYSuH - ONLY for WhatsApp / Social sharing preview
// SECOND IMAGE (icon): 15uUNmSET8F0ye6Skchhl1Er_PKZsmJUa - ONLY for PWA App Icon
const PWA_IDS = {
  "icon": "15uUNmSET8F0ye6Skchhl1Er_PKZsmJUa",
  "preview": "1OtdbFTZBXfn0NLCikorJQHlL74MpYSuH"
};

// Strict startup comparison check for PWA IDs
function selfCheckPwaIdsServer() {
  const spec = {
    "icon": "15uUNmSET8F0ye6Skchhl1Er_PKZsmJUa",
    "preview": "1OtdbFTZBXfn0NLCikorJQHlL74MpYSuH"
  };
  if (PWA_IDS.icon === spec.icon && PWA_IDS.preview === spec.preview) {
    console.log("ID OK");
  } else {
    console.log("ID MISMATCH");
  }
}
selfCheckPwaIdsServer();

// In-memory cache for processed PWA image buffers
const pwaBufferCache: Record<string, Buffer> = {};

// Helper to fetch Google Drive buffer using candidate URLs in order
async function getRawDriveBuffer(fileId: string): Promise<Buffer | null> {
  const candidateUrls = [
    `https://lh3.googleusercontent.com/d/${fileId}`,
    `https://drive.google.com/uc?export=view&id=${fileId}`,
    `https://drive.usercontent.google.com/download?id=${fileId}&export=view`,
    `https://drive.google.com/thumbnail?id=${fileId}&sz=w1600`
  ];

  for (const url of candidateUrls) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
        },
        redirect: 'follow',
        signal: AbortSignal.timeout(8000)
      });
      if (response.ok) {
        const arrayBuf = await response.arrayBuffer();
        return Buffer.from(arrayBuf);
      }
    } catch (err) {
      console.warn(`[Proxy Buffer] Failed candidate ${url}:`, err);
    }
  }
  return null;
}

// Server-side helper to fetch Google Drive envelope image with 8s timeout
async function fetchGoogleDriveImage(fileId: string): Promise<Response | null> {
  const candidateUrls = [
    `https://lh3.googleusercontent.com/d/${fileId}`,
    `https://drive.google.com/uc?export=view&id=${fileId}`,
    `https://drive.usercontent.google.com/download?id=${fileId}&export=view`,
    `https://drive.google.com/thumbnail?id=${fileId}&sz=w2000`
  ];

  for (const url of candidateUrls) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
        },
        redirect: 'follow',
        signal: AbortSignal.timeout(8000)
      });
      if (response.ok) {
        return response;
      }
    } catch (err) {
      console.warn(`[Proxy Image] Failed candidate ${url}:`, err);
    }
  }

  return null;
}

// Proxy API Route for Envelope Image
app.get('/api/envelope', async (req, res) => {
  try {
    const localEnvelope = path.resolve(__dirname, 'public/envelope.jpg');
    if (fs.existsSync(localEnvelope)) {
      return res.sendFile(localEnvelope);
    }

    const driveRes = await fetchGoogleDriveImage(ENVELOPE_ID);
    if (!driveRes || !driveRes.body) {
      return res.status(502).send('Could not fetch envelope image from Google Drive');
    }

    const contentType = driveRes.headers.get('content-type') || 'image/jpeg';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');

    Readable.fromWeb(driveRes.body as any).pipe(res);
  } catch (err) {
    console.error('[API Envelope Error]:', err);
    if (!res.headersSent) {
      res.status(502).send('Error proxying envelope image');
    }
  }
});

// Generic Proxy API Route for any Google Drive decor/event asset
app.get('/api/drive-asset/:id', async (req, res) => {
  try {
    const fileId = req.params.id;
    if (!fileId || typeof fileId !== 'string') {
      return res.status(400).send('Missing file id');
    }

    const driveRes = await fetchGoogleDriveImage(fileId);
    if (!driveRes || !driveRes.body) {
      return res.status(502).send('Could not fetch drive asset');
    }

    const contentType = driveRes.headers.get('content-type') || 'image/png';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');

    Readable.fromWeb(driveRes.body as any).pipe(res);
  } catch (err) {
    console.error('[API Drive Asset Error]:', err);
    if (!res.headersSent) {
      res.status(502).send('Error proxying drive asset');
    }
  }
});

// PWA Icon Routes (Generated STRICTLY from PWA_IDS.icon)
app.get('/icon-192.png', async (req, res) => {
  try {
    if (!pwaBufferCache['icon-192']) {
      const raw = await getRawDriveBuffer(PWA_IDS.icon);
      if (!raw) return res.status(502).send('Failed to fetch icon asset');
      pwaBufferCache['icon-192'] = await sharp(raw)
        .resize(192, 192, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer();
    }
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(pwaBufferCache['icon-192']);
  } catch (err) {
    console.error('Error serving /icon-192.png:', err);
    if (!res.headersSent) res.status(500).send('Error generating icon');
  }
});

app.get('/icon-512.png', async (req, res) => {
  try {
    if (!pwaBufferCache['icon-512']) {
      const raw = await getRawDriveBuffer(PWA_IDS.icon);
      if (!raw) return res.status(502).send('Failed to fetch icon asset');
      pwaBufferCache['icon-512'] = await sharp(raw)
        .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer();
    }
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(pwaBufferCache['icon-512']);
  } catch (err) {
    console.error('Error serving /icon-512.png:', err);
    if (!res.headersSent) res.status(500).send('Error generating icon');
  }
});

app.get('/icon-maskable-512.png', async (req, res) => {
  try {
    if (!pwaBufferCache['icon-maskable-512']) {
      const raw = await getRawDriveBuffer(PWA_IDS.icon);
      if (!raw) return res.status(502).send('Failed to fetch icon asset');
      pwaBufferCache['icon-maskable-512'] = await sharp(raw)
        .resize(410, 410, { fit: 'contain', background: { r: 74, g: 14, b: 28, alpha: 1 } })
        .flatten({ background: '#4A0E1C' })
        .extend({ top: 51, bottom: 51, left: 51, right: 51, background: '#4A0E1C' })
        .resize(512, 512)
        .png()
        .toBuffer();
    }
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(pwaBufferCache['icon-maskable-512']);
  } catch (err) {
    console.error('Error serving /icon-maskable-512.png:', err);
    if (!res.headersSent) res.status(500).send('Error generating maskable icon');
  }
});

app.get('/apple-touch-icon.png', async (req, res) => {
  try {
    if (!pwaBufferCache['apple-touch-icon']) {
      const raw = await getRawDriveBuffer(PWA_IDS.icon);
      if (!raw) return res.status(502).send('Failed to fetch icon asset');
      pwaBufferCache['apple-touch-icon'] = await sharp(raw)
        .resize(180, 180, { fit: 'contain', background: { r: 74, g: 14, b: 28, alpha: 1 } })
        .flatten({ background: '#4A0E1C' })
        .png()
        .toBuffer();
    }
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(pwaBufferCache['apple-touch-icon']);
  } catch (err) {
    console.error('Error serving /apple-touch-icon.png:', err);
    if (!res.headersSent) res.status(500).send('Error generating apple touch icon');
  }
});

app.get('/favicon.ico', async (req, res) => {
  try {
    if (!pwaBufferCache['favicon']) {
      const raw = await getRawDriveBuffer(PWA_IDS.icon);
      if (!raw) return res.status(502).send('Failed to fetch icon asset');
      pwaBufferCache['favicon'] = await sharp(raw)
        .resize(48, 48, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer();
    }
    res.setHeader('Content-Type', 'image/x-icon');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(pwaBufferCache['favicon']);
  } catch (err) {
    console.error('Error serving /favicon.ico:', err);
    if (!res.headersSent) res.status(500).send('Error generating favicon');
  }
});

// WhatsApp / Social Sharing Preview Image Route (Generated STRICTLY from PWA_IDS.preview)
app.get(['/whatsapp-preview-v2.jpg', '/whatsapp-preview.jpg', '/og-preview-v2.jpg', '/og-preview.jpg'], async (req, res) => {
  try {
    if (!pwaBufferCache['whatsapp-preview-v2']) {
      const raw = await getRawDriveBuffer(PWA_IDS.preview);
      if (!raw) return res.status(502).send('Failed to fetch preview asset');
      pwaBufferCache['whatsapp-preview-v2'] = await sharp(raw)
        .resize(1200, 630, { fit: 'cover' })
        .jpeg({ quality: 80, progressive: true })
        .toBuffer();
    }
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(pwaBufferCache['whatsapp-preview-v2']);
  } catch (err) {
    console.error('Error serving whatsapp preview image:', err);
    if (!res.headersSent) res.status(500).send('Error generating WhatsApp preview image');
  }
});

app.get('/manifest.json', (req, res) => {
  res.setHeader('Content-Type', 'application/manifest+json');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.json({
    id: "/",
    name: "Aarav & Ananya Wedding Invitation",
    short_name: "Aarav&Ananya",
    description: "Join us in celebrating the wedding of Aarav Sharma & Ananya Verma on December 14, 2026 in Jaipur.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#4A0E1C",
    theme_color: "#4A0E1C",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable"
      }
    ]
  });
});

app.get('/sw.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Cache-Control', 'no-cache');
  res.send(`
const CACHE_NAME = 'wedding-invitation-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/invite-v2',
  '/invite',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/apple-touch-icon.png',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-maskable-512.png',
  '/whatsapp-preview-v2.jpg',
  '/whatsapp-preview.jpg',
  '/og-preview-v2.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
          }
        }).catch(() => {});
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && event.request.url.startsWith(self.location.origin)) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
        }
        return networkResponse;
      });
    })
  );
});
  `);
});

// Helper function to inject dynamic OG URLs into HTML template
function injectOpenGraphMeta(template: string, req: express.Request): string {
  const host = req.get('host') || 'localhost:3000';
  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
  const fullUrl = `${protocol}://${host}${req.originalUrl}`;
  const fullImgUrl = `${protocol}://${host}/whatsapp-preview-v2.jpg`;

  let html = template;
  html = html.replace(/<meta property="og:url" content="[^"]*"/, `<meta property="og:url" content="${fullUrl}"`);
  html = html.replace(/<meta property="og:image" content="[^"]*"/, `<meta property="og:image" content="${fullImgUrl}"`);
  html = html.replace(/<meta property="og:image:secure_url" content="[^"]*"/, `<meta property="og:image:secure_url" content="${fullImgUrl}"`);
  html = html.replace(/<meta name="twitter:image" content="[^"]*"/, `<meta name="twitter:image" content="${fullImgUrl}"`);
  return html;
}

async function main() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist'), { index: false }));

    // Support /, /invite-v2, and /invite routes returning HTTP 200 without redirecting
    app.get(['/', '/invite-v2', '/invite'], (req, res) => {
      const htmlPath = path.join(__dirname, 'dist', 'index.html');
      if (fs.existsSync(htmlPath)) {
        let template = fs.readFileSync(htmlPath, 'utf-8');
        template = injectOpenGraphMeta(template, req);
        res.status(200).set({ 'Content-Type': 'text/html' }).send(template);
      } else {
        res.status(404).send('Not Found');
      }
    });

    app.get('*', (req, res) => {
      const htmlPath = path.join(__dirname, 'dist', 'index.html');
      if (fs.existsSync(htmlPath)) {
        let template = fs.readFileSync(htmlPath, 'utf-8');
        template = injectOpenGraphMeta(template, req);
        res.status(200).set({ 'Content-Type': 'text/html' }).send(template);
      } else {
        res.status(404).send('Not Found');
      }
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        template = injectOpenGraphMeta(template, req);
        res.status(200).set({ 'Content-Type': 'text/html' }).send(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

main();
