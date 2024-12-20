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
const orders_1 = require("../orders/orders");
dotenv_1.default.config();
const router = (0, express_1.Router)();
// Set the secret key to the Stripe API
// @ts-ignore
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2020-08-27',
});
router.post('/check-client-secret', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const clientSecret = (_a = req === null || req === void 0 ? void 0 : req.body) === null || _a === void 0 ? void 0 : _a.clientSecret;
        const orderId = (0, orders_1.decryptOrderId)((_b = req === null || req === void 0 ? void 0 : req.body) === null || _b === void 0 ? void 0 : _b.orderId);
        const items = (_c = req === null || req === void 0 ? void 0 : req.body) === null || _c === void 0 ? void 0 : _c.items;
        const paymentIntendId = clientSecret.split('_secret')[0];
        const paymentIntent = yield stripe.paymentIntents.retrieve(paymentIntendId);
        const order = yield wooCommerceApi_1.default.get(`orders/${orderId}`);
        // check metadata  of paymentIntend
        if (paymentIntent.metadata.order_id !== orderId && order) {
            res.send({ status: 'failed' });
            //
        }
        else {
            // if paymentIntent is succeeded
            if (paymentIntent.status === 'succeeded') {
                res.send({ status: 'succeeded' });
            }
            else if (paymentIntent.status === 'requires_payment_method') {
                // if items updated
                const totalPrice = yield (0, computeProductItemsTotalPrice_1.computeProductsTotalPrice)(items);
                // update order
                const existingOrderItems = order.data.line_items.map((item) => ({
                    id: item.id,
                    quantity: 0,
                }));
                const newLineItems = items.map((item) => ({
                    product_id: item.productId,
                    quantity: item.quantity,
                }));
                yield wooCommerceApi_1.default.patch(`orders/${orderId}`, {
                    line_items: [...existingOrderItems, ...newLineItems],
                });
                // update stripe
                yield stripe.paymentIntents.update(paymentIntendId, {
                    amount: totalPrice,
                });
                res.send({ status: 'requires_payment_method' });
            }
            else {
                res.send({ status: paymentIntent.status });
            }
        }
    }
    catch (error) {
        console.error(error);
        // @ts-ignore
        res.status(500).send({ error: error.message });
    }
}));
router.post('/create-payment-intent', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const productItems = ((_a = req === null || req === void 0 ? void 0 : req.body) === null || _a === void 0 ? void 0 : _a.items) || [];
        const totalPrice = yield (0, computeProductItemsTotalPrice_1.computeProductsTotalPrice)(productItems);
        // create order
        // Create Stripe Payment Intent
        const order = yield (0, createOrder_1.createWooCommerceOrder)({
            items: productItems,
            totalPrice,
        });
        const paymentIntent = yield stripe.paymentIntents.create({
            amount: totalPrice,
            currency: 'ron', // Romanian Lei
            payment_method_types: ['card'],
            metadata: {
                // Pass WooCommerce order ID in metadata once it's created
                order_id: order.id,
            },
        });
        // Create WooCommerce Order
        // Update Payment Intent metadata with the correct WooCommerce Order ID
        res.send({
            clientSecret: paymentIntent.client_secret,
            orderId: (0, orders_1.encryptOrderId)(order.id),
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
            id: (0, orders_1.decryptOrderId)(orderData.orderId),
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
            status: orderData.deliveryMethod === 'ramburs' ? 'on-hold' : 'pending', //on-hold = ramburs, pending = card
            payment_method: orderData.deliveryMethod === 'ramburs' ? 'cod' : 'card',
        };
        // Update the WooCommerce order details
        // @ts-ignore
        yield wooCommerceApi_1.default.put(`orders/${order.id}`, Object.assign({}, order));
        res.send({ success: true });
    }
    catch (error) {
        // @ts-ignore
        res.status(500).send({ error: error.message });
    }
}));
exports.default = router;
