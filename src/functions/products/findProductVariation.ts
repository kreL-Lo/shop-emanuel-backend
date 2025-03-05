import wooCommerceApi from '../../apiSetup/wooCommerceApi';
import { Product } from '../../types/product';

const findProductVariation = async (product: Product) => {
	if (product.type === 'variable') {
		// firt variation from list
		const variationId = product.variations[0];
		const response = await wooCommerceApi.get(
			`/products/${product.id}/variations/${variationId}`
		);
		//@ts-ignore
		product.displayVariation = response.data;
	}
	//get review
	const rating = await wooCommerceApi.get(`/products/reviews`, {
		params: {
			product: product.id,
		},
	});
	if (rating.data.length === 1) {
		product.average_rating = rating.data[0].rating;
	}
};

const findProductsVariations = async (products: Product[]) => {
	await Promise.all(products.map(findProductVariation));
};

export default findProductsVariations;
