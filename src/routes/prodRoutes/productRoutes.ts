// @ts-nocheck
import { Router } from 'express';
import wooCommerceApi from '../../apiSetup/wooCommerceApi';
import findProductVariation from '../../functions/products/findProductVariation';
import findProductsVariations from '../../functions/products/findProductVariation';
import { paramsProduct } from './prodUtils';

const router = Router();
const MENU_ITEMS = {
	BMS: 'bms',
	SUPORTI_CARCASE: 'suporti_carcase',
	PLAT_BANDA: 'plat-banda',
	ECHIPAMENTE: 'echipamente',
	CELULE: 'celule',
	BATERII_MOPED: 'baterii-moped',
	SUDURA_PUNCTE: 'sudura-puncte',
	INCARCATOARE: 'incarcatoare',
	CABLU_CONECTORI: 'cablu-conectori',
	PROTECTIE_AMBALARE: 'protectie-ambalare',
	TESTERE_BATERII: 'tester-baterii',
};

// Fetch Products Route
router.get('/search/:name', async (req, res) => {
	const { page = 1, per_page = 20 } = req.query; // Default: page 1, 10 products per page
	const { name } = req.params;
	// get the rest of url ?category= value
	const { category } = req.query;

	let validCategory = null;
	if (category) {
		//find in menu types
		if (MENU_ITEMS[category]) {
			validCategory = { slug: MENU_ITEMS[category] };
		}
	}
	try {
		const params = {
			search: name,
			page,
			per_page,
			...paramsProduct,
		};

		if (name === 'all') {
			params.search = '';
		}

		// Add category to the parameters if valid
		if (validCategory) {
			params.category = validCategory.slug;
		}

		const response = await wooCommerceApi.get(
			`/products?page=${page}&per_page=${per_page}`,
			{ params }
		);
		// Send WooCommerce response to the client
		res.status(200).json({
			page: parseInt(page),
			per_page: parseInt(per_page),
			total: parseInt(response.headers['x-wp-total']),
			total_pages: parseInt(response.headers['x-wp-totalpages']),
			products: response.data,
		});
	} catch (error) {
		console.error('Error fetching products:', error.message);
		res.status(error.response?.status || 500).json({
			error: error.message || 'Internal Server Error',
		});
	}
});

router.get('/noutati', async (req, res) => {
	try {
		const response = await wooCommerceApi.get('/products', {
			// limit to 10 products
			// first 10 products
			params: {
				per_page: 10, // Limit to 10 products
				orderby: 'date', // Order by creation date
				order: 'desc', // Descending order (most recent first)
				...paramsProduct,
			},
		});
		const products = response.data;
		await findProductsVariations(products);
		res.json(products);
	} catch (error) {
		console.error('Error fetching products:', error);
		res.status(500).json({ error: 'Failed to fetch products' });
	}
});
router.get('/product/:slug', async (req, res) => {
	const { slug } = req.params;
	try {
		// get slug of product
		const response = await wooCommerceApi.get(`/products?slug=${slug}`, {
			...paramsProduct,
		});
		const product = response.data[0];

		if (product?.variations.length > 0) {
			const variationsResponse = await wooCommerceApi.get(
				`/products/${product.id}/variations`
			);
			product.variations = variationsResponse.data;
		}

		const rating = await wooCommerceApi.get(`/products/reviews`, {
			params: {
				product: product.id,
			},
		});
		if (rating.data.length === 1) {
			product.average_rating = rating.data[0].rating;
		}
		// retunr response
		res.json(product);
	} catch (error) {
		console.error('Error fetching product:', error.message);
		res.status(500).json({ error: 'Failed to fetch product' });
	}
});

router.get('/all', async (req, res) => {
	try {
		const response = await wooCommerceApi.get('/products', {
			...paramsProduct,
		});
		const products = response.data;
		await findProductsVariations(products);
		res.json(products);
	} catch (error) {
		console.error('Error fetching products:', error);
		res.status(500).json({ error: 'Failed to fetch products' });
	}
});

export default router;
