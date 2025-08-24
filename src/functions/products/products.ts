import wooCommerceApi from '../../apiSetup/wooCommerceApi';
import { ProductItem } from './computeProductItemsTotalPrice';

export const getAllProducts = async (productItems: ProductItem[]) => {
	try {
		const productIds = productItems.map((item) => item.productId);
		const products = await wooCommerceApi.get(`/products`, {
			include: productIds.join(','),
		});
		let productData = [];
		for (const item of productItems) {
			const product = products.data.find(
				// @ts-ignore
				(product) => product.id === item.productId
			);
			if (product) {
				const prodObj = {
					...product,
				};
				//variation
				if (item.variationId) {
					const variationData = await wooCommerceApi.get(
						`/products/${item.productId}/variations/${item.variationId}`
					);

					const variation = variationData.data;
					if (variation) {
						prodObj.variation = variation;
					}
				}

				productData.push(prodObj);
			}
		}
		return productData;
	} catch (error) {
		// @ts-ignore
		throw new Error('Failed to get products', error);
	}
};
