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

router.post('/check-client-secret', async (req, res) => {
	try {
		const clientSecret = req?.body?.clientSecret;
		const orderId = req?.body?.orderId;
		const items = req?.body?.items;

		const paymentIntendId = clientSecret.split('_secret')[0];
		const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntendId);

		const order = await wooCommerceApi.get(`orders/${orderId}`);
		// check metadata  of paymentIntend
		if (paymentIntent.metadata.order_id !== orderId && order) {
			res.send({ status: 'failed' });
			//
		} else {
			// if paymentIntent is succeeded
			if (paymentIntent.status === 'succeeded') {
				res.send({ status: 'succeeded' });
			} else if (paymentIntent.status === 'requires_payment_method') {
				// if items updated
				const totalPrice = await computeProductsTotalPrice(items);
				console.log('here', totalPrice, items);
				// update order

				await wooCommerceApi.put(`orders/${orderId}`, {
					line_items: items.map((item: any) => ({
						product_id: item.productId,
						quantity: item.quantity,
					})),
				});

				// update stripe
				await stripe.paymentIntents.update(paymentIntendId, {
					amount: totalPrice,
				});

				res.send({ status: 'requires_payment_method' });
			} else {
				res.send({ status: paymentIntent.status });
			}
		}
	} catch (error) {
		console.error(error);
		// @ts-ignore
		res.status(500).send({ error: error.message });
	}
});
router.post('/create-payment-intent', async (req, res) => {
	try {
		const productItems = req?.body?.items || [];
		const totalPrice = await computeProductsTotalPrice(productItems);
		// create order

		// Create Stripe Payment Intent
		const order = await createWooCommerceOrder({
			items: productItems,
			totalPrice,
		});
		const paymentIntent = await stripe.paymentIntents.create({
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
			orderId: order.id,
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
			// @ts-ignore
			id: orderData.orderId,
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
		await wooCommerceApi.put(`orders/${order.id}`, {
			...order,
		});
		res.send({ success: true });
	} catch (error) {
		// @ts-ignore
		res.status(500).send({ error: error.message });
	}
});

export default router;
