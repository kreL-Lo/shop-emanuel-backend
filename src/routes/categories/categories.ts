import { Router } from 'express';
import wooCommerceApi from '../../apiSetup/wooCommerceApi';
import findProductsVariations from '../../functions/products/findProductVariation';

const router = Router();
// @ts-ignore
router.get('/', async (req, res) => {
	try {
		const response = await wooCommerceApi.get('/products/categories', {
			params: {
				parent: 0,
			},
		});
		// get all parent categories

		// for each category get 5 products
		const data = await Promise.all(
			// @ts-ignore
			response.data.map(async (category) => {
				const products = await wooCommerceApi.get('/products', {
					params: {
						category: category.id,
						per_page: 5,
					},
				});

				//get all subcategories
				const subCategories = await wooCommerceApi.get('/products/categories', {
					params: {
						parent: category.id,
					},
				});
				await findProductsVariations(products.data);
				return {
					...category,
					products: products.data,
					subCategories: subCategories.data,
				};
			})
		);

		return res.json(data);
	} catch (error) {
		//
		console.log('Error:', error);
		res.status(500).json({ error: 'Failed to fetch products' });
	}
});

export default router;
