import express from 'express';
import dotenv from 'dotenv';

import allRoutes from './routes/index';
import webHookRouter from './routes/payment/webhook';
//@ts-check
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
// CORS configuration
const webhookRawBodyParser = express.raw({ type: 'application/json' });

app.post('/webhook', webhookRawBodyParser, webHookRouter);

// Request logging middleware
app.use((req, res, next) => {
	const startTime = Date.now();

	// Log the incoming request
	console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);

	// Capture the original end function
	const originalEnd = res.end;

	// Override the end function to log response
	res.end = function (
		chunk?: any,
		encoding?: any,
		cb?: (() => void) | undefined
	) {
		const duration = Date.now() - startTime;
		console.log(
			`[${new Date().toISOString()}] ${req.method} ${req.url} - ${
				res.statusCode
			} (${duration}ms)`
		);

		// Call the original end function and return its result
		return originalEnd.call(this, chunk, encoding, cb);
	};

	next();
});

//@ts-ignore
app.use((req, res, next) => {
	// Set Cache-Control headers
	res.set(
		'Cache-Control',
		'no-store, no-cache, must-revalidate, proxy-revalidate'
	);
	res.set('Pragma', 'no-cache');
	res.set('Expires', '0');
	res.set('Surrogate-Control', 'no-store');

	// Set CORS headers
	// res.header('Access-Control-Allow-Origin', 'https://armondone.com');
	// allow localhost for testing
	res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
	res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
	res.header(
		'Access-Control-Allow-Headers',
		'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With'
	);

	// Handle preflight OPTIONS requests
	if (req.method === 'OPTIONS') {
		return res.status(200).end();
	}

	// Pass control to the next middleware
	next();
});

// Middleware to parse JSON
app.use(express.json());

app.use('/api', allRoutes);

app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});
