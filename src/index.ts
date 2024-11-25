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

// Middleware to parse JSON
app.use(express.json());

// Handle preflight OPTIONS requests globally
app.options('*', cors(corsOptions));

// Cache control for dynamic content
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
