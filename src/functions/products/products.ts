import wooCommerceApi from '../../apiSetup/wooCommerceApi';
import { ProductItem } from './computeProductItemsTotalPrice';
import findProductsVariations from './findProductVariation';

export const getAllProducts = async (productItems: ProductItem[]) => {
	try {
		const productIds = productItems.map((item) => item.productId);
		const products = await wooCommerceApi.get(`/products`, {
			params: {
				include: productIds.join(','),
			},
		});
		await findProductsVariations(products.data);
		return products.data;
	} catch (error) {
		throw new Error('Failed to get products');
	}
};
