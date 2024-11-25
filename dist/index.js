"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
const search_products_1 = __importDefault(require("./routes/search-products"));
// @ts-ignore
const cors_1 = __importDefault(require("cors"));
dotenv_1.default.config();
// CORS configuration for specific origins
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Middleware
const corsOptions = {
    origin: 'http://localhost:3000', // Frontend domain
    methods: ['GET', 'POST'], // Allowed methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
};
app.use((0, cors_1.default)(corsOptions)); // Apply CORS to all routes
app.use(express_1.default.json());
// Routes
app.use('/products', productRoutes_1.default);
app.use('/search-products', search_products_1.default);
// Basic health check
app.get('/', (req, res) => {
    res.send('WooCommerce API Integration is running');
});
// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
