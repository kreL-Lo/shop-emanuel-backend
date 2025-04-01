import { Router } from 'express';
import wooCommerceApi from '../../apiSetup/wooCommerceApi';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import {
	checkBundleItems,
	computeProductsTotalPrice,
} from '../../functions/products/computeProductItemsTotalPrice';
import { createWooCommerceOrder } from '../../functions/orders/createOrder';
import { OrderData } from '../../functions/orders/orderBuilde';
import { Order } from '../../types/order';
import { decryptOrderId, encryptOrderId } from '../orders/orders';
import { isValidToken, validateToken } from '../auth/auth';
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
		const orderId = decryptOrderId(req?.body?.orderId);
		const items = req?.body?.items;
		const bundleKey = req.body.bundleKey;
		const paymentIntendId = clientSecret.split('_secret')[0];
		const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntendId);
		const order = await wooCommerceApi.get(`/orders/${orderId}`);
		//test bundle key
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
				const totalPrice = await computeProductsTotalPrice(items, bundleKey);
				// update order
				const existingOrderItems = order.data.line_items.map((item: any) => ({
					id: item.id,
					quantity: 0, // Placeholder, will be removed before sending
				}));

				const newLineItems = items.map((item: any) => ({
					product_id: item.productId,
					quantity: item.quantity,
					...(item.variationId && { variation_id: item.variationId }),
				}));

				const bundleItems = checkBundleItems(bundleKey);
				// Merge, then filter out zero-quantity items
				await wooCommerceApi.patch(`/orders/${orderId}`, {
					line_items: [...existingOrderItems, ...newLineItems], // Remove `quantity: 0`
					total: totalPrice,
					//metadata
					meta_data: [
						{
							key: 'bundle_items',
							value: bundleItems,
						},
					],
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
		const bundleKey = req.body.bundleKey;
		await isValidToken(req);
		const productItems = req?.body?.items || [];
		const totalPrice = await computeProductsTotalPrice(productItems, bundleKey);
		// create order

		// Create Stripe Payment Inte	nt
		const order = await createWooCommerceOrder({
			items: productItems,
			totalPrice,
			// @ts-ignore
			user: req['user'] || null,
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
			orderId: encryptOrderId(order.id),
		});
	} catch (error) {
		// @ts-ignore
		res.status(500).send({ error: error.message });
	}
});

router.post('/update-order-details', validateToken, async (req, res) => {
	try {
		await isValidToken(req);
		const orderData: OrderData = req.body.orderData;
		//@ts-ignore
		let customer_id = req['user']?.id || null;
		const order: Order = {
			// @ts-ignore
			id: decryptOrderId(orderData.orderId),
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
		if (customer_id) {
			order.customer_id = customer_id;
		}
		// Update the WooCommerce order details
		// @ts-ignore
		await wooCommerceApi.put(`/orders/${order.id}`, {
			...order,
		});
		res.send({ success: true });
	} catch (error) {
		// @ts-ignore
		res.status(500).send({ error: error.message });
	}
});

export default router;
