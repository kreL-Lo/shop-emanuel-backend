"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const index_1 = __importDefault(require("./routes/index"));
const webhook_1 = __importDefault(require("./routes/payment/webhook"));
//@ts-check
dotenv_1.default.config();
const allowedOrigins = '*';
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// CORS configuration
//@ts-ignore
app.use((req, res, next) => {
    // Set Cache-Control headers
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.set('Surrogate-Control', 'no-store');
    // Set CORS headers
    res.header('Access-Control-Allow-Origin', allowedOrigins);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');
    // Handle preflight OPTIONS requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    // Pass control to the next middleware
    next();
});
// Middleware to parse JSON
app.post('/webhook', express_1.default.raw({ type: 'application/json' }), webhook_1.default);
app.use(express_1.default.json());
app.use('/', index_1.default);
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
