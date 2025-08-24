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

	// Set CORS headerssudo fuser -k 3001/tcp
	res.header('Access-Control-Allow-Origin', 'https://atelieruldebaterii.ro');
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
