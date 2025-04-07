import db from '../../apiSetup/db';
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

export const queryForPromotedProducts: () => Promise<
	{ id: number }[]
> = async () => {
	const [rows] = await db.query(`
		SELECT p.ID, p.post_title
		FROM wp_posts p
		JOIN wp_postmeta pm ON p.ID = pm.post_id
		WHERE pm.meta_key = '_upsell_ids'
			AND pm.meta_value != 'a:0:{}'
			AND p.post_type = 'product'
			AND p.post_status = 'publish';
	`);

	return rows.map((row: { ID: number; post_title: string }) => ({
		id: row.ID,
	}));
};
