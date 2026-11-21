import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';

// Ensure SQLite local persistence and safe JWT secret before backend modules initialize
process.env.DB_DIALECT ||= 'sqlite';
process.env.DB_STORAGE ||= path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'oasis.sqlite');
process.env.JWT_SECRET ||= 'oasis-resort-skardu-local-runtime-jwt-secret-key-2026';
process.env.ADMIN_EMAIL ||= 'admin@oasisresort.pk';
process.env.ADMIN_PASSWORD ||= 'ChangeMe123!';

const PORT = 3000;
const HOST = '0.0.0.0';
const ROOT = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const { bootstrapBackend } = await import('./backend/src/bootstrap.js');
  const { errorHandler, notFoundHandler } = await import('./backend/src/middleware/error.js');
  const { UPLOAD_DIR } = await import('./backend/src/middleware/upload.js');
  const { sequelize } = await import('./backend/src/config/db.js');
  const { default: adminRoutes } = await import('./backend/src/routes/admin/index.js');
  const { default: authRoutes } = await import('./backend/src/routes/auth.js');
  const { default: blogRoutes } = await import('./backend/src/routes/blog.js');
  const { default: guestRestaurantRoutes } = await import('./backend/src/routes/guestRestaurant.js');
  const { default: paymentClaimsRoutes } = await import('./backend/src/routes/paymentClaims.js');
  const { default: publicRoutes } = await import('./backend/src/routes/public.js');

  await bootstrapBackend();
  console.log('Oasis Resort SQLite database initialized and seeded.');

  const app = express();
  app.set('trust proxy', 1);
  app.disable('x-powered-by');
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: '1mb' }));

  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  app.use('/uploads', express.static(UPLOAD_DIR, { maxAge: '30d' }));

  app.get('/api/health', async (_req, res) => {
    const db = await sequelize.authenticate().then(() => 'connected', () => 'disconnected');
    res.status(db === 'connected' ? 200 : 503).json({ ok: db === 'connected', db });
  });

  app.use('/api/public/restaurant', guestRestaurantRoutes);
  app.use('/api/public/blog', blogRoutes);
  app.use('/api/public/payments', paymentClaimsRoutes);
  app.use('/api/public', publicRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api', notFoundHandler);
  app.use('/uploads', notFoundHandler);

  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(ROOT, 'dist');
    app.use(express.static(distDir, { index: false, maxAge: '1h' }));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.use(errorHandler);

  app.listen(PORT, HOST, () => {
    console.log(`Oasis Resort Skardu server running on http://${HOST}:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start Oasis Resort server:', err);
  process.exit(1);
});
