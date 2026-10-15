import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { Readable } from 'stream';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

const ENVELOPE_ID = '1zaZ2nIJZOj2RrS4ImbTrolJtmqeLhxGJ';

// Server-side helper to fetch Google Drive envelope image with 8s timeout
async function fetchGoogleDriveImage(fileId: string): Promise<Response | null> {
  const candidateUrls = [
    `https://lh3.googleusercontent.com/d/${fileId}`,
    `https://drive.google.com/thumbnail?id=${fileId}&sz=w2000`,
    `https://drive.google.com/uc?export=view&id=${fileId}`
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

async function main() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
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
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
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
