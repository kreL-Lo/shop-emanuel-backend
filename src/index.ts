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
	origin: [
		'https://atelieruldebaterii.ro',
		'https://www.atelieruldebaterii.ro',
		'http://atelieruldebaterii.ro',
		'attelieruldebaterii.ro',
	],
	methods: ['GET', 'POST'],
	allowedHeaders: ['Content-Type', 'Authorization'],
	credentials: true, // Allow cookies if needed
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Middleware to parse JSON
app.use(express.json());

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
