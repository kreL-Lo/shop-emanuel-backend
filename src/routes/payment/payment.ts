import { Router } from 'express';
import wooCommerceApi from '../../apiSetup/wooCommerceApi';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import rawBody from 'raw-body';
import express from 'express';
dotenv.config();

const router = Router();

// Set the secret key to the Stripe API
// @ts-ignore
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
	apiVersion: '2020-08-27',
});

export const WOOCOMMERCE_PAYMENT_METHODS = {
	cod: 'cod',
	stripe: 'stripe',
};

const createWooCommerceOrder = async () => {
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

		const response = await wooCommerceApi.post('orders', orderData);
		// @ts-ignore
		return response.data.id; // Return the WooCommerce order ID
	} catch (error) {
		console.error('Error creating WooCommerce order:', error);
		throw new Error('Failed to create WooCommerce order');
	}
};

router.post('/create-payment-intent', async (req, res) => {
	try {
		// Example order amount in RON (Romanian Lei)
		const amount = 10000; // 10000 RON = 100 RON (for testing purposes, change as needed)
		// const wooCommerceOrderId = await createWooCommerceOrder();

		// Create the payment intent in RON
		const paymentIntent = await stripe.paymentIntents.create({
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
	} catch (error) {
		console.error(error);
		// @ts-ignore
		res.status(500).send({ error: error.message });
	}
});

// Webhook endpoint to listen for successful payments
// @ts-ignore

// Function to update WooCommerce order status using WooCommerce API
// @ts-ignore
export const updateWooCommerceOrder = async (orderId, status) => {
	console.log('Updating WooCommerce order:', orderId);
	try {
		// WooCommerce API request
		//@ts-ignore
		wooCommerceApi.put(`orders/${orderId}`, {
			status: status,
		});
	} catch (error) {
		throw new Error('Failed to update WooCommerce order');
	}
};

// Start the server
export default router;
