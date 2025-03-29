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

	const categoryIds = product.categories.map((category: any) => category.id);
	const categoryIdsString = categoryIds.join(',');

	//get products with the same categories
	const response = await wooCommerceApi.get(`/products`, {
		params: {
			...paramsProduct,
			category: categoryIdsString,
			per_page: 4,
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
