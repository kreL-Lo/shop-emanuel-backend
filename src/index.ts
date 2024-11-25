import express from 'express';
import dotenv from 'dotenv';
import productRoutes from './routes/productRoutes';
import searchProducts from './routes/search-products';
// @ts-ignore
import cors from 'cors';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration
const corsOptions = {
	origin: 'https://atelieruldebaterii.ro', // Your frontend's URL
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
	allowedHeaders: ['Content-Type', 'Authorization'],
	credentials: true, // Allow cookies/auth headers if necessary
};

// Apply CORS middleware
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use((req, res, next) => {
	res.set(
		'Cache-Control',
		'no-store, no-cache, must-revalidate, proxy-revalidate'
	);
	res.set('Pragma', 'no-cache');
	res.set('Expires', '0');
	res.set('Surrogate-Control', 'no-store');
	// set header
	res.header('Allow-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
	res.header(
		'Access-Control-Allow-Headers',
		'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With'
	);
	res.header('Access-Control-Allow-Credentials', 'true');
	// pass to next layer of middleware

	next();
});
// Middleware to parse JSON
app.use(express.json());

// Handle preflight OPTIONS requests globally

// Cache control for dynamic content

// Routes
app.use('/products', productRoutes);
app.use('/search-products', searchProducts);

// Basic health check
app.get('/', (req, res) => {
	res.send('WooCommerce API Integration is running');
});

// Start the server
app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});
