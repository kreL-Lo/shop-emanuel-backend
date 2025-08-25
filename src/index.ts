import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import allRoutes from './routes/index';
import webHookRouter from './routes/payment/webhook';

dotenv.config();
const app = express();

// Use a different port than Next.js dev server (3000)
const PORT = process.env.PORT || 8000;

const allowedOrigins = ['http://localhost:3000', 'https://armondone.com'];

// ---- CORS FIRST ----
app.use(
	cors({
		origin: (origin, cb) => {
			if (!origin) return cb(null, true); // allow curl / same-origin
			return allowedOrigins.includes(origin)
				? cb(null, true)
				: cb(new Error('Not allowed by CORS'));
		},
		credentials: true, // required if frontend sets withCredentials: true
		methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
	})
);
app.use((req, res, next) => {
	if (req.method === 'OPTIONS') {
		console.log(`[PREFLIGHT] ${req.url} from Origin: ${req.headers.origin}`);
	}
	if (req.method === 'POST') {
		console.log(`[POST] ${req.url} at ${new Date().toISOString()}`);
	}
	next();
});
// Ensure proxies/caches treat per-origin separately
app.use((req, res, next) => {
	res.setHeader('Vary', 'Origin');
	next();
});

// ---- Webhook route (raw body parser) ----
const webhookRawBodyParser = express.raw({ type: 'application/json' });
app.post('/webhook', webhookRawBodyParser, webHookRouter);

// ---- Regular body parser for rest ----
app.use(express.json({ limit: '5mb' }));

// ---- Optional cache-control / logging ----
app.use((req, res, next) => {
	res.set(
		'Cache-Control',
		'no-store, no-cache, must-revalidate, proxy-revalidate'
	);
	res.set('Pragma', 'no-cache');
	res.set('Expires', '0');
	res.set('Surrogate-Control', 'no-store');
	next();
});

// ---- API routes ----
app.use('/api', allRoutes);

// ---- Start server ----
app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});
