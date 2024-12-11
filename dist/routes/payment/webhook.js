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
const dotenv_1 = __importDefault(require("dotenv"));
const stripe_1 = __importDefault(require("stripe"));
const payment_1 = require("./payment");
dotenv_1.default.config();
// @ts-ignore
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2020-08-27',
});
// @ts-ignore
const stripeWebook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let event;
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_KEY;
    try {
        // Use the raw request body for verification
        // @ts-ignore
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    }
    catch (err) {
        // @ts-ignore
        console.error('Webhook signature verification failed:', err.message);
        // @ts-ignore
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    // Handle specific webhook events
    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        const orderId = paymentIntent.metadata.order_id;
        console.log(`Payment for Order ${orderId} succeeded.`);
        try {
            // Update WooCommerce order status
            yield (0, payment_1.updateWooCommerceOrder)(orderId, 'completed');
            console.log(`Order ${orderId} updated to completed.`);
        }
        catch (error) {
            // @ts-ignore
            console.error(`Error updating WooCommerce order: ${error.message}`);
            return (res
                .status(500)
                // @ts-ignore
                .send(`Error updating WooCommerce order: ${error.message}`));
        }
    }
    res.status(200).json({ received: true });
});
exports.default = stripeWebook;
