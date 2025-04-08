import { Router } from 'express';
import wooCommerceApi from '../../apiSetup/wooCommerceApi';
import { ProductVariation } from '../../types/productVariation';
import { Product } from '../../types/product';
import findProductsVariations from '../../functions/products/findProductVariation';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { validateToken } from '../auth/auth';
import { Customer } from '../../types/customer';
dotenv.config();

const router = Router();

// Define the encryption key and algorithm
const ENCRYPTION_KEY = Buffer.from(
	process.env.ORDER_ENCRIPTION_KEY || '',
	'hex'
);

const IV_LENGTH = 16; // AES block size

// Function to encrypt a JSON object
export const encryptJSON = (
	data: object,
	key: Buffer = ENCRYPTION_KEY
): string => {
	const iv = crypto.randomBytes(IV_LENGTH); // Generate a random initialization vector
	const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

	const jsonData = JSON.stringify(data); // Convert JSON to string
	let encrypted = cipher.update(jsonData, 'utf8', 'hex');
	encrypted += cipher.final('hex');

	// Return the IV and encrypted data as a single string
	return `${iv.toString('hex')}:${encrypted}`;
};

// Function to decrypt an encrypted JSON string
export const decryptJSON = (
	encryptedData: string,
	key: Buffer = ENCRYPTION_KEY
): object => {
	const [ivHex, encryptedHex] = encryptedData.split(':'); // Split the IV and encrypted data
	const iv = Buffer.from(ivHex, 'hex');
	const encryptedText = Buffer.from(encryptedHex, 'hex');

	const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

	let decrypted = decipher.update(encryptedText.toString('hex'), 'hex', 'utf8');
	decrypted += decipher.final('utf8');

	// Parse the decrypted string back into a JSON object
	return JSON.parse(decrypted);
};

/*
Given an array of product ids give me the products and also calculate the sum of the price
use Woo commerce api to get the products and their prices
*/

router.post('/items', async (req, res) => {
	try {
		const items: [
			{
				productId: number;
				variationId: number;
			}
		] = req.body.items;
		const allProductId = items.map((item) => item.productId);
		const productItems: { [key: number]: number[] } = {};

		for (let i = 0; i < items.length; i++) {
			if (productItems[items[i].productId]) {
				productItems[items[i].productId].push(items[i].variationId);
			} else {
				productItems[items[i].productId] = [items[i].variationId];
			}
		}

		//get all products

		//get all products
		const products: { data: [Product] } = await wooCommerceApi.get(
			'/products',
			{
				params: {
					include: allProductId.join(','),
				},
				//@ts-ignore
			}
		);

		//get all products variation

		//
		const data = await Promise.all(
			products.data.map(async (product) => {
				//fetch variations
				// @ts-ignore
				product.cartVariations = [];

				// @ts-ignore
				const variations: { data: [ProductVariation] } = await wooCommerceApi
					.get(`/products/${product.id}/variations`, {
						params: {
							include: productItems[product.id].join(','),
						},
						//@ts-ignore
					})
					.catch((e) => {
						return product;
					});
				//@ts-ignore
				product.cartVariations = variations.data;

				// @ts-ignore
				if (product.status === 'private') {
					//get all groupped products

					// 					// here [ { id: 4859, key: 'linkedIds', value: [ [Object] ] } ]
					const meta =
						product.meta_data.find((meta: any) => meta.key === 'linkedIds') ||
						[];

					const ids = meta.value;

					const groupedProducts = await wooCommerceApi.get('/products', {
						params: {
							include: ids.join(','),
						},
					});

					await findProductsVariations(groupedProducts.data);
					product.groupedProducts = groupedProducts.data || [];
					//@ts-ignore
					product?.groupedProducts.forEach((groupedProduct: any) => {
						const quantity = product.meta_data.find(
							(meta: any) => meta.key === 'quantity'
						);
						// @ts-ignore
						groupedProduct.quantity =
							quantity?.value.find(
								(value: any) => value.id === groupedProduct.id
							)?.quantity || 0;

						groupedProduct.quantity = Number(groupedProduct.quantity);
					});
				}
				return product;
			})
		);

		//make sure they all fit the same format

		const productsToFormat = items.map((item) => {
			const product = data.find((product) => product.id === item.productId);
			//@ts-ignore
			const variation = product.cartVariations.find(
				(variation: any) => variation.id === item.variationId
			);
			//@ts-ignore
			const clonedProduct = { ...product, cartVariation: variation };
			return clonedProduct;
		});

		// bundleKey validate
		const bundleKey = req.body.bundleKey || '';
		const bundleItems = req.body.bundleItems || [];
		const bundleMainItem = req.body.bundleMainItem || {
			productId: '',
			variationId: '',
		};

		// find bundle main item
		//get bundle main item producti d

		const emptyState = {
			bundleKey: '',
			bundleItems: [],
			bundleMainItem: {
				productId: '',
				variationId: '',
			},
		};
		const prodMainItem = await wooCommerceApi.get('/products', {
			params: {
				include: bundleMainItem.productId,
			},
		});
		const bundleMainItemProduct = prodMainItem.data[0] as Product;
		if (!bundleMainItemProduct) {
			res.status(200).send({ products: productsToFormat, ...emptyState });
			return;
		}

		if (bundleMainItem.variationId) {
			const variation = await wooCommerceApi.get(
				`/products/${bundleMainItemProduct.id}/variations`,
				{
					params: {
						include: bundleMainItem.variationId,
					},
				}
			);
			const variationData = variation.data[0] as ProductVariation;
			if (!variationData) {
				res.status(200).send({ products: productsToFormat, ...emptyState });
				return;
			}
		}
		let actualItems = [];
		if (bundleKey === '') {
			res.status(200).send({ products: productsToFormat, ...emptyState });
			return;
		}
		try {
			// @ts-ignore
			actualItems = decryptJSON(bundleKey);
		} catch (e) {
			res.status(200).send({ products: productsToFormat, ...emptyState });
			return;
		}
		if (JSON.stringify(actualItems) !== JSON.stringify(bundleItems)) {
			res.status(200).send({ products: productsToFormat, ...emptyState });
			return;
		}

		res.status(200).send({
			products: productsToFormat,
			bundleKey,
			bundleItems: bundleItems,
			bundleMainItem: bundleMainItem,
		});
	} catch (e) {
		console.log(e);
		res.status(500).send('Internal Server Error');
	}
});

type Item = {
	productId: number;
	variationId: number;
};
router.post('/create-bundle-key', async (req, res) => {
	//
	//items ->
	try {
		const items: Item[] = req.body.items;
		// check that items are valid

		const productIds = items.map((item) => item.productId);
		const products = (
			await wooCommerceApi.get('/products', {
				params: {
					include: productIds.join(','),
				},
			})
		).data;

		if (products.length !== productIds.length) {
			res.status(400).send('Invalid Items');
			return;
		}
		// for all products get variations
		// @ts-ignore
		const allVariations = [];

		await Promise.all(
			products.map(async (product: any) => {
				const variations = (
					await wooCommerceApi.get(`/products/${product.id}/variations`)
				).data;
				allVariations.push(...variations);
			})
		);

		let countItemsVariations = 0;
		for (let x of items) {
			if (x.variationId) {
				countItemsVariations++;
			}
		}
		// @ts-ignore
		const allVariationIds = allVariations.map((variation) => variation.id);
		const allVariationIdsSet = new Set(allVariationIds);
		// if variations exists
		for (let x of items) {
			if (x.variationId && !allVariationIdsSet.has(x.variationId)) {
				res.status(400).send('Invalid Items');
				return;
			}
		}

		const key = encryptJSON(items);
		const _items = decryptJSON(key);
		const displayKey = 'bundle_' + key.slice(0, 6);
		res.status(200).send({ key, displayKey });
	} catch (e) {
		console.log(e);
		res.status(500).send('Internal Server Error');
	}
});

router.get('/test-bundley-key', async (req, res) => {
	try {
		const key = req.query.key as string;
		if (!key) {
			res.status(400).send('Invalid Key');
			return;
		}
		const items = decryptJSON(key);
		res.status(200).send({ items });
	} catch (e) {
		console.log(e);
		res.status(500).send('Internal Server Error');
	}
});
router.get('/bundle-items', async (req, res) => {
	try {
	} catch (e) {
		console.log(e);
		res.status(500).send('Internal Server Error');
	}
});

router.post('/sync-cart', validateToken, async (req, res) => {
	try {
		// @ts-ignore
		const user = req.user as Customer;

		const { items, bundleKey, bundleItems, bundleMainItem, orderNote } =
			req.body;

		const cartObjectIndex = user.meta_data.findIndex(
			(meta) => meta.key === 'cartObject'
		);

		if (cartObjectIndex !== -1) {
			// Update existing cartObject
			user.meta_data[cartObjectIndex].value = {
				items: items,
				bundleKey: bundleKey,
				bundleItems: bundleItems,
				bundleMainItem: bundleMainItem,
				orderNote: orderNote,
			};
		} else {
			// @ts-ignore
			user.meta_data.push({
				key: 'cartObject',
				value: {
					items: items,
					bundleKey: bundleKey,
					bundleItems: bundleItems,
					bundleMainItem: bundleMainItem,
					orderNote: orderNote,
				},
			});
		}

		// add a metadata key cart_updated_at
		const cartUpdatedAtIndex = user.meta_data.findIndex(
			(meta) => meta.key === 'cart_updated_at'
		);
		if (cartUpdatedAtIndex !== -1) {
			// Update existing cart_updated_at
			user.meta_data[cartUpdatedAtIndex].value = new Date().getTime();
		} else {
			// @ts-ignore
			user.meta_data.push({
				key: 'cart_updated_at',
				value: new Date().getTime(),
			});
		}

		await wooCommerceApi.put(`/customers/${user.id}`, {
			// @ts-ignore
			meta_data: user.meta_data,
		});

		res.status(200).send({
			message: 'Cart synced successfully',
		});
	} catch (e) {
		console.log(e);
		res.status(500).send('Internal Server Error');
	}
});

export default router;
