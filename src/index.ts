import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import allRoutes from './routes/index';
import webHookRouter from './routes/payment/webhook';

dotenv.config();
const app = express();

// Pick a backend port that doesn't clash with Next dev (often 8000)
const PORT = process.env.PORT || 8000;

const allowedOrigins = ['http://localhost:3000', 'https://armondone.com'];

// ---- CORS FIRST (before any routes) ----
app.use(
	cors({
		origin: (origin, cb) => {
			// Allow requests without Origin (e.g., curl, same-origin)
			if (!origin) return cb(null, true);
			return allowedOrigins.includes(origin)
				? cb(null, true)
				: cb(new Error('Not allowed by CORS'));
		},
		credentials: true,
		methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
	})
);

// Make sure Express sets these for every response (esp. for proxies/caches)
app.use((req, res, next) => {
	res.setHeader('Vary', 'Origin');
	next();
});

// Dedicated preflight for webhook (important when using express.raw)
app.options(
	'/webhook',
	cors({
		origin: allowedOrigins,
		credentials: true,
		methods: ['POST', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
	})
);

// ---- Body parsers ----
// Webhook must use raw BEFORE json for signature verification.
const webhookRawBodyParser = express.raw({ type: 'application/json' });
app.post('/webhook', webhookRawBodyParser, webHookRouter);

// Regular JSON for everything else
app.use(express.json({ limit: '5mb' }));

// (Optional) Request logging / cache headers
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

// Your API routes
app.use('/api', allRoutes);

app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});
