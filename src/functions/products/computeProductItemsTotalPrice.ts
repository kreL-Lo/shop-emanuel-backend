import { all } from 'axios';
import wooCommerceApi from '../../apiSetup/wooCommerceApi';
import { getAllProducts } from './products';
import { decryptJSON } from '../../routes/cart/cart';

type Item = {
	quantity: number;
	variationId: string;
};

// @ts-ignore
const buildKeyForBundleItems = (bundleItems) => {
	if (bundleItems) {
		return bundleItems.map(
			(item: { productId: number; variationId: number }) => {
				let key = '';
				let productId = item.productId;
				let variationId = item.variationId;
				if (variationId) {
					key += `${productId}-${variationId}`;
				} else {
					key += `${productId}`;
				}
				// @ts-ignore
				return {
					id: key,
					productId: productId,
					variationId: variationId,
				};
			}
		);
	}
	return [];
};

export type ProductItem = {
	productId: string;
	quantity: number;
	variationId: string;
};

export const checkBundleItems = (bundleKey: string) => {
	if (bundleKey === '') {
		return [];
	}

	try {
		// @ts-ignore
		const items = decryptJSON(bundleKey);
		const bundleItems = buildKeyForBundleItems(items);
		return bundleItems;
	} catch (e) {
		throw new Error(`Failed to check bundle items ${e}`);
	}
};
export const computeProductsTotalPrice = async (
	productItems: ProductItem[],
	bundleKey: string
) => {
	try {
		if (!productItems) {
			return 0;
		}

		const allProducts = await getAllProducts(productItems);

		const bundleItems = checkBundleItems(bundleKey);
		let total = 0;

		//for each product get variation if exists
		productItems.forEach((item) => {
			// @ts-ignore
			const product = allProducts.find((p) => p.id === item.productId);
			let price = 0;
			if (item.variationId) {
				price = product.variation.price;
			} else {
				price = product.price;
			}
			let id = `${item.productId}`;
			if (item.variationId) {
				id = `${item.productId}-${item.variationId}`;
			}
			// @ts-ignore
			if (bundleItems.find((b) => b.id === id)) {
				total += Number(price) * Number(item.quantity) * 0.95;
			} else {
				total += Number(price) * Number(item.quantity);
			}
			// total += price * item.quantity;
		});

		return total * 100;
	} catch (e) {
		throw new Error(`Failed to compute total price ${e}`);
	}
};
