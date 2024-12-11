"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateWooCommerceOrder = exports.WOOCOMMERCE_PAYMENT_METHODS = void 0;
const express_1 = require("express");
const wooCommerceApi_1 = __importDefault(require("../../apiSetup/wooCommerceApi"));
const stripe_1 = __importDefault(require("stripe"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const router = (0, express_1.Router)();
// Set the secret key to the Stripe API
// @ts-ignore
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2020-08-27',
});
exports.WOOCOMMERCE_PAYMENT_METHODS = {
    cod: 'cod',
    stripe: 'stripe',
};
const createWooCommerceOrder = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orderData = {
            payment_method: 'bacs', // Payment method (change as needed)
            payment_method_title: 'Direct Bank Transfer',
            set_paid: false, // Set to false until payment is confirmed
            billing: {
                first_name: 'John',
                last_name: 'Doe',
                address_1: '123 Main St',
                city: 'Bucharest',
                postcode: '010101',
                country: 'RO',
                email: 'johndoe@example.com',
                phone: '1234567890',
            },
            shipping: {
                first_name: 'John',
                last_name: 'Doe',
                address_1: '123 Main St',
                city: 'Bucharest',
                postcode: '010101',
                country: 'RO',
            },
            line_items: [
                {
                    product_id: 123, // Replace with a valid product ID from your store
                    quantity: 1,
                },
            ],
        };
        const response = yield wooCommerceApi_1.default.post('orders', orderData);
        // @ts-ignore
        return response.data.id; // Return the WooCommerce order ID
    }
    catch (error) {
        console.error('Error creating WooCommerce order:', error);
        throw new Error('Failed to create WooCommerce order');
    }
});
router.post('/create-payment-intent', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Example order amount in RON (Romanian Lei)
        const amount = 10000; // 10000 RON = 100 RON (for testing purposes, change as needed)
        // const wooCommerceOrderId = await createWooCommerceOrder();
        // Create the payment intent in RON
        const paymentIntent = yield stripe.paymentIntents.create({
            amount: amount, // Total amount in smallest unit of RON (like cents in USD)
            currency: 'ron', // Set currency to Romanian Lei
            payment_method_types: ['card'], // Only allow 'card' as a payment method, preventing Link
            metadata: {
            // order_id: wooCommerceOrderId, // Pass the WooCommerce order ID as metadata
            },
        });
        res.send({
            clientSecret: paymentIntent.client_secret,
        });
    }
    catch (error) {
        console.error(error);
        // @ts-ignore
        res.status(500).send({ error: error.message });
    }
}));
// Webhook endpoint to listen for successful payments
// @ts-ignore
// Function to update WooCommerce order status using WooCommerce API
// @ts-ignore
const updateWooCommerceOrder = (orderId, status) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Updating WooCommerce order:', orderId);
    try {
        // WooCommerce API request
        //@ts-ignore
        wooCommerceApi_1.default.put(`orders/${orderId}`, {
            status: status,
        });
    }
    catch (error) {
        throw new Error('Failed to update WooCommerce order');
    }
});
exports.updateWooCommerceOrder = updateWooCommerceOrder;
// Start the server
exports.default = router;
