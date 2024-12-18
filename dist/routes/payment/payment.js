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
const express_1 = require("express");
const wooCommerceApi_1 = __importDefault(require("../../apiSetup/wooCommerceApi"));
const stripe_1 = __importDefault(require("stripe"));
const dotenv_1 = __importDefault(require("dotenv"));
const computeProductItemsTotalPrice_1 = require("../../functions/products/computeProductItemsTotalPrice");
const createOrder_1 = require("../../functions/orders/createOrder");
dotenv_1.default.config();
const router = (0, express_1.Router)();
// Set the secret key to the Stripe API
// @ts-ignore
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2020-08-27',
});
router.post('/create-payment-intent', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const productItmes = ((_a = req === null || req === void 0 ? void 0 : req.body) === null || _a === void 0 ? void 0 : _a.items) || [];
        const totalPrice = yield (0, computeProductItemsTotalPrice_1.computeProductsTotalPrice)(productItmes);
        // create order
        const order = yield (0, createOrder_1.createWooCommerceOrder)({
            items: productItmes,
            totalPrice,
        });
        // Example order amount in RON (Romanian Lei)
        // const wooCommerceOrderId = await createWooCommerceOrder();
        // Create the payment intent in RON
        const paymentIntent = yield stripe.paymentIntents.create({
            amount: totalPrice,
            currency: 'ron', // Set currency to Romanian Lei
            payment_method_types: ['card'], // Only allow 'card' as a payment method, preventing Link
            metadata: {
                order_id: order.id, // Pass the WooCommerce order ID as metadata
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
router.post('/update-order-details', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orderData = req.body.orderData;
        //@ts-ignore
        const order = {
            // @ts-ignore
            id: orderData.id,
            billing: {
                first_name: orderData.billingAddress.firstName,
                last_name: orderData.billingAddress.lastName,
                address_1: orderData.billingAddress.address,
                address_2: orderData.billingAddress.apartment,
                city: orderData.billingAddress.city,
                postcode: orderData.billingAddress.postalCode,
                country: orderData.billingAddress.county,
                phone: orderData.billingAddress.phone,
                email: orderData.email,
            },
            shipping: {
                first_name: orderData.deliveryAddress.firstName,
                last_name: orderData.deliveryAddress.lastName,
                address_1: orderData.deliveryAddress.address,
                address_2: orderData.deliveryAddress.apartment,
                city: orderData.deliveryAddress.city,
                postcode: orderData.deliveryAddress.postalCode,
                country: orderData.deliveryAddress.county,
                phone: orderData.deliveryAddress.phone,
            },
            status: 'processing',
        };
        // Update the WooCommerce order details
        console.log('orderData', order.id);
        // @ts-ignore
        yield wooCommerceApi_1.default.put(`orders/${order.id}`, Object.assign({}, order));
        res.send({ success: true });
    }
    catch (error) {
        console.error(error);
        // @ts-ignore
        res.status(500).send({ error: error.message });
    }
}));
exports.default = router;
