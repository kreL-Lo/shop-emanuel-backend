import express from 'express';
import dotenv from 'dotenv';
import productRoutes from './routes/productRoutes';
import searchProducts from './routes/search-products';
// @ts-ignore
import cors from 'cors';
dotenv.config();

// CORS configuration for specific origins

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware

const corsOptions = {
	origin: 'http://localhost:3000', // Frontend domain
	methods: ['GET', 'POST'], // Allowed methods
	allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
};

app.use(cors(corsOptions)); // Apply CORS to all routes

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
