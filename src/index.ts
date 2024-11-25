import express from 'express';
import dotenv from 'dotenv';
import productRoutes from './routes/productRoutes';
import searchProducts from './routes/search-products';
//@ts-check
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
// CORS configuration
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

// Routes
app.use('/products', productRoutes);
app.use('/search-products', searchProducts);
// Start the server
app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});
