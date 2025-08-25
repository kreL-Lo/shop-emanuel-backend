import { Router } from 'express';
import crypto from 'crypto';
import dotenv from 'dotenv';
import wooCommerceApi from '../../apiSetup/wooCommerceApi';
import { Order } from '../../types/order';
import { Product } from '../../types/product';
import findProductsVariations from '../../functions/products/findProductVariation';
import { validateToken } from '../auth/auth';
dotenv.config();

const key = Buffer.from(process.env.ORDER_ENCRIPTION_KEY || '', 'hex');

//test encryption

export const encryptOrderId = (orderId: string | number) => {
	const iv = crypto.randomBytes(16); // Generate a 16-byte initialization vector
	const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

	// Convert orderId to a string
	const orderIdString = orderId.toString();

	let encrypted = cipher.update(orderIdString, 'utf-8'); // Ensure 'utf-8' encoding
	encrypted = Buffer.concat([encrypted, cipher.final()]);

	// Return the IV along with the encrypted data
	const f = `${iv.toString('hex')}:${encrypted.toString('hex')}`;
	return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
};

export const decryptOrderId = (encryptedOrderId: string) => {
	const [ivHex, encryptedHex] = encryptedOrderId.split(':'); // Split the IV and encrypted data
	const iv = Buffer.from(ivHex, 'hex');
	const encryptedData = Buffer.from(encryptedHex, 'hex');

	const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

	let decrypted = decipher.update(encryptedData);
	decrypted = Buffer.concat([decrypted, decipher.final()]);

	return decrypted.toString('utf-8');
};

type ProductWithQuantity = {
	product: Product;
	quantity: number;
};
const router = Router();

router.get('/order/:orderKey', async (req, res) => {
	try {
		const orderKey = req.params.orderKey.toString();
		const orderId = decryptOrderId(orderKey);

		// get order
		const order = await wooCommerceApi.get(`orders/${orderId}`);
		const {
			data,
		}: {
			data: Order;
		} = order;
		let products: ProductWithQuantity[] = [];
		if (data.line_items) {
			products = await wooCommerceApi.get('products', {
				include: data.line_items.map((item) => item.product_id).join(','),
			});
			// @ts-ignore
			await findProductsVariations(products.data);
			//@ts-ignore
			products = products.data.map((product: Product) => {
				//@ts-ignore
				const quantity = data.line_items.find(
					(item) => item.product_id === product.id
				)?.quantity;
				return {
					...product,
					dbQuantity: quantity || 0,
				};
			});
		}
		res.send({
			order: {
				total: data.total,
				status: data.status,
				shipping: data.shipping,
				billing: data.billing,
				payment_method: data.payment_method,
				payment_method_title: data.payment_method_title,
				products: products,
				line_items: data.line_items,
			},
		});
	} catch (e) {
		console.log(e);
		// @ts-ignore
		res.status(500).send({ error: e.message });
	}
});

router.get('/', validateToken, async (req, res) => {
	try {
		// @ts-ignore

		const user = req?.user;
		const { page = 1, per_page = 5 } = req.query;
		const orders = await wooCommerceApi.get('orders', {
			customer: user.id,
			page,
			per_page,
		});
		orders.data = orders.data.map((order: Order) => {
			const encryptedOrderId = encryptOrderId(order.id);
			return {
				...order,
				id: encryptedOrderId,
			};
		});

		res.send({
			orders: orders.data,
			page: orders.headers['x-wp-totalpages'],
			total: Math.floor(
				Number(orders.headers['x-wp-total']) / Number(per_page)
			),
		});
	} catch (e) {
		//@ts-ignore
		res.status(500).send({ error: e.message });
	}
});

// export router
export default router;
