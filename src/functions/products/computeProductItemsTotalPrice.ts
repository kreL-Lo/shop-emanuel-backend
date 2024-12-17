import { getAllProducts } from './products';

export type ProductItem = {
	productId: string;
	quantity: number;
};

export const computeProductsTotalPrice = async (
	productItems: ProductItem[]
) => {
	try {
		if (!productItems) {
			return 0;
		}
		const productIds = productItems.map((product) => product.productId);

		const allProducts = await getAllProducts(productIds);

		const total = productItems.reduce((acc, product) => {
			// @ts-ignore
			const productData = allProducts.find((p) => p.id === product.productId);
			if (!productData) {
				return acc;
			}
			return acc + productData.price * product.quantity;
		}, 0);

		return total * 100;
	} catch (e) {
		throw new Error(`Failed to compute total price ${e}`);
	}
};
