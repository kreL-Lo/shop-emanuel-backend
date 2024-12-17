import { Router } from 'express';
import wooCommerceApi from '../../apiSetup/wooCommerceApi';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import { computeProductsTotalPrice } from '../../functions/products/computeProductItemsTotalPrice';
import { createWooCommerceOrder } from '../../functions/orders/createOrder';
import { OrderData } from '../../functions/orders/orderBuilde';
import { Order } from '../../types/order';
dotenv.config();

const router = Router();

// Set the secret key to the Stripe API
// @ts-ignore
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
	apiVersion: '2020-08-27',
});

router.post('/create-payment-intent', async (req, res) => {
	try {
		const productItmes = req?.body?.items || [];
		const totalPrice = await computeProductsTotalPrice(productItmes);
		// create order
		const order = await createWooCommerceOrder({
			items: productItmes,
			totalPrice,
		});
		// Example order amount in RON (Romanian Lei)
		// const wooCommerceOrderId = await createWooCommerceOrder();
		// Create the payment intent in RON
		const paymentIntent = await stripe.paymentIntents.create({
			amount: totalPrice,
			currency: 'ron', // Set currency to Romanian Lei
			payment_method_types: ['card'], // Only allow 'card' as a payment method, preventing Link
			metadata: {
				order_id: order.id, // Pass the WooCommerce order ID as metadata
			},
		});
		console.log('paymentIntent', paymentIntent);
		res.send({
			clientSecret: paymentIntent.client_secret,
		});
	} catch (error) {
		console.error(error);
		// @ts-ignore
		res.status(500).send({ error: error.message });
	}
});

router.post('/update-order-details', async (req, res) => {
	try {
		const orderData: OrderData = req.body.orderData;
		//@ts-ignore
		const order: Order = {
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

		// @ts-ignore
		await wooCommerceApi.post(`orders/${orderData.id}`, {
			...order,
		});
		res.send({ success: true });
	} catch (error) {
		console.error(error);
		// @ts-ignore
		res.status(500).send({ error: error.message });
	}
});

export default router;
