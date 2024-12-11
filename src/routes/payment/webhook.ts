import { Router } from 'express';
import express from 'express';
import dotenv from 'dotenv';
import Stripe from 'stripe';
import { updateWooCommerceOrder } from './payment';
dotenv.config();
// @ts-ignore
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
	apiVersion: '2020-08-27',
});

// @ts-ignore
const stripeWebook = async (req, res) => {
	let event;

	const sig = req.headers['stripe-signature'];
	const endpointSecret = process.env.STRIPE_WEBHOOK_KEY;
	try {
		// Use the raw request body for verification
		// @ts-ignore
		event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
	} catch (err) {
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
			await updateWooCommerceOrder(orderId, 'completed');
			console.log(`Order ${orderId} updated to completed.`);
		} catch (error) {
			// @ts-ignore
			console.error(`Error updating WooCommerce order: ${error.message}`);
			return (
				res
					.status(500)
					// @ts-ignore
					.send(`Error updating WooCommerce order: ${error.message}`)
			);
		}
	}

	res.status(200).json({ received: true });
};

export default stripeWebook;
