import express from 'express';
import dotenv from 'dotenv';

import allRoutes from './routes/index';
import webHookRouter from './routes/payment/webhook';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8000;

// (optional) if behind a proxy and using cookies
app.set('trust proxy', 1);

// ---- Permissive CORS (reflect origin, allow credentials, handle preflight) ----
// @ts-ignore
app.use((req, res, next) => {
	const origin = req.headers.origin || '*';
	res.header('Access-Control-Allow-Origin', origin);
	res.header('Vary', 'Origin');
	res.header('Access-Control-Allow-Credentials', 'true');
	res.header(
		'Access-Control-Allow-Methods',
		'GET,POST,PUT,PATCH,DELETE,OPTIONS'
	);
	res.header(
		'Access-Control-Allow-Headers',
		'Content-Type, Authorization, X-Requested-With'
	);
	if (req.method === 'OPTIONS') return res.sendStatus(204);
	next();
});

// ---- Webhook route (raw body parser) ----
const webhookRawBodyParser = express.raw({ type: 'application/json' });
app.post('/webhook', webhookRawBodyParser, webHookRouter);

// Request logging middleware
app.use((req, res, next) => {
	const startTime = Date.now();
	const clientIP =
		req.ip ||
		req.connection.remoteAddress ||
		req.socket.remoteAddress ||
		(req.connection as any)?.socket?.remoteAddress ||
		req.headers['x-forwarded-for']?.toString().split(',')[0].trim() ||
		req.headers['x-real-ip'] ||
		'unknown';

	console.log(
		`[${new Date().toISOString()}] ${clientIP} - ${req.method} ${req.url}`
	);

	const originalEnd = res.end;
	res.end = function (chunk?: any, encoding?: any, cb?: () => void) {
		const duration = Date.now() - startTime;
		console.log(
			`[${new Date().toISOString()}] ${clientIP} - ${req.method} ${req.url} - ${
				res.statusCode
			} (${duration}ms)`
		);
		return originalEnd.call(this, chunk, encoding, cb);
	};
	next();
});

// ---- Regular body parser for rest ----
app.use(express.json({ limit: '5mb' }));

// ---- Optional cache-control ----
app.use((_, res, next) => {
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
