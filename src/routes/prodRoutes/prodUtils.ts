import wooCommerceApi from '../../apiSetup/wooCommerceApi';
import { Product } from '../../types/product';

export const paramsProduct = {
	status: 'publish',
};

export const getProductSimilarProducts = async ({
	product,
}: {
	product: Product;
}) => {
	const id = product.id;

	//get product categories

	const similarProductIds = product.upsell_ids || [];
	if (similarProductIds.length === 0) {
		return [];
	}
	const response = await wooCommerceApi.get(`/products`, {
		params: {
			...paramsProduct,
			include: similarProductIds.join(','),

			exclude: id,
		},
	});

	await Promise.all(
		response.data.map(async (product: Product) => {
			const variationsResponse = await wooCommerceApi.get(
				`/products/${product.id}/variations`
			);
			product.variations = variationsResponse.data;
		})
	);
	Object.assign(product, { similarProducts: response.data });
};
