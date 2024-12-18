import dotenv from 'dotenv';
import Stripe from 'stripe';
import { updateWooCommerceOrderStatus } from '../../functions/orders/updateWoocommerceOrder';
dotenv.config();
// @ts-ignore
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
	apiVersion: '2020-08-27',
});

// @ts-ignore
const stripeWebook = async (req, res) => {
	let event;

	// Stripe signature from request headers
	const sig = req.headers['stripe-signature'];
	const endpointSecret = process.env.STRIPE_WEBHOOK_KEY;
	try {
		// Construct the event using raw body and signature
		// @ts-ignore
		event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
	} catch (err) {
		//@ts-ignore
		console.error('Webhook signature verification failed:', err.message);
		//@ts-ignore
		return res.status(400).send(`Webhook Error: ${err.message}`);
	}

	// Handle the event based on type
	if (event.type === 'payment_intent.succeeded') {
		const paymentIntent = event.data.object;
		const orderId = paymentIntent.metadata.order_id;

		try {
			// Update WooCommerce order status
			await updateWooCommerceOrderStatus({ orderId, status: 'completed' });
		} catch (error) {
			//@ts-ignore
			console.error(`Error updating WooCommerce order: ${error.message}`);
			return (
				res
					.status(500)
					//@ts-ignore
					.send(`Error updating WooCommerce order: ${error.message}`)
			);
		}
	}

	// Respond with status 200 to acknowledge receipt of the event
	res.status(200).json({ received: true });
};

export default stripeWebook;
