import { Router } from 'express';
import wooCommerceApi from '../../apiSetup/wooCommerceApi';
import findProductsVariations from '../../functions/products/findProductVariation';
import { paramsProduct } from '../prodRoutes/prodUtils';
import { Category } from '../../types/category';

const router = Router();
// @ts-ignore

router.get('/specific-category/:query', async (req, res) => {
	try {
		const { query } = req.params;
		//get category father
		const response = await wooCommerceApi.get('/products/categories', {
			params: {
				slug: query,
			},
		});
		const category: Category = response.data[0];
		let parentCategory = null;
		if (category.parent === 0) {
			// @ts-ignore
			parentCategory = category;
		} else {
			// get parent category
			const parentResponse = await wooCommerceApi.get(
				`/products/categories/${category.parent}`
			);
			// @ts-ignore
			parentCategory = parentResponse.data;
		}
		const page = req.query.page || 1;
		const per_page = req.query.per_page || 12;

		const queryProducts = {
			page: page,
			per_page: per_page,
			category: category.id,
			...paramsProduct,
		};

		// get products of category
		const products = await wooCommerceApi.get('/products', {
			params: queryProducts,
		});
		await findProductsVariations(products.data);

		//get subcategories
		const subCategories = await wooCommerceApi.get('/products/categories', {
			params: {
				parent: parentCategory.id,
			},
		});

		const relatedCategories = [parentCategory, ...subCategories.data];
		return res.json({
			category: category,
			parentCategory: parentCategory,
			products: {
				page: page,
				per_page: per_page,
				total: parseInt(products.headers['x-wp-total']),
				total_pages: parseInt(products.headers['x-wp-totalpages']),
				products: products.data,
			},
			subCategories: relatedCategories,
		});
	} catch (e) {
		console.log('Error:', e);
		res.status(500).json({ error: 'Failed to fetch products' });
	}
	res.status(200).json({ message: 'ok' });
});
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
						...paramsProduct,
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

// @ts-ignore
router.get('/all', async (req, res) => {
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
				//get all subcategories
				const subCategories = await wooCommerceApi.get('/products/categories', {
					params: {
						parent: category.id,
					},
				});
				return {
					...category,
					subCategories: subCategories.data,
				};
			})
		);

		return res.json(data);
	} catch (error) {
		//
		console.log('Error:', error);
		res.status(500).json({ error: 'Failed to fetch categories' });
	}
});
export default router;
