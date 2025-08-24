import wooCommerceApi from '../../apiSetup/wooCommerceApi';
import { Product } from '../../types/product';

const findProductVariation = async (product: Product) => {
	if (product.type === 'variable') {
		// firt variation from list
		// @ts-ignore
		product.displayVariation = null;
		const variationId = product?.variations[0];
		if (variationId) {
			const response = await wooCommerceApi.get(
				`/products/${product.id}/variations/${variationId}`
			);
			//@ts-ignore
			product.displayVariation = response.data;
		}
	}
	//get review
	const rating = await wooCommerceApi.get(`/products/reviews`, {
		product: product.id,
	});
	if (rating.data.length === 1) {
		//edge case
		product.average_rating = rating.data[0].rating;
		product.rating_count = 1;
	}
};

const findProductsVariations = async (products: Product[]) => {
	await Promise.all(products.map(findProductVariation));
};

export default findProductsVariations;
