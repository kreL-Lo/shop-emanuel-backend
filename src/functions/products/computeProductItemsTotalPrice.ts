import { all } from 'axios';
import wooCommerceApi from '../../apiSetup/wooCommerceApi';
import { getAllProducts } from './products';

export type ProductItem = {
	productId: string;
	quantity: number;
	variationId: string;
};

export const computeProductsTotalPrice = async (
	productItems: ProductItem[]
) => {
	try {
		if (!productItems) {
			return 0;
		}

		const allProducts = await getAllProducts(productItems);

		let total = 0;

		//for each product get variation if exists
		productItems.forEach((item) => {
			// @ts-ignore
			const product = allProducts.find((p) => p.id === item.productId);
			let price = 0;
			if (item.variationId) {
				price = product.displayVariation.price;
			} else {
				price = product.price;
			}
			total += price * item.quantity;
		});

		return total * 100;
	} catch (e) {
		throw new Error(`Failed to compute total price ${e}`);
	}
};
