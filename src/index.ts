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
	origin: [
		'https://atelieruldebaterii.ro',
		'https://www.atelieruldebaterii.ro/',
		'http://atelieruldebaterii.ro',
		'attelieruldebaterii.ro',
	], // Frontend domain
	methods: ['GET', 'POST'], // Allowed methods
	allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
};

app.use(express.json());

// Routes
app.use('/products', productRoutes);

app.use('/search-products', searchProducts);

app.use(function (req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', 'https://atelieruldebaterii.ro');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
	// @ts-ignore
	res.setHeader('Access-Control-Allow-Credentials', true);
	next();
});

// Basic health check
app.get('/', (req, res) => {
	res.send('WooCommerce API Integration is running');
});

app.options('*', cors(corsOptions)); // Handle preflight requests for all routes

app.use(cors(corsOptions)); // Apply CORS to all routes

// Start the server
app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});
