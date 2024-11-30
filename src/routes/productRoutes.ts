// @ts-nocheck
import { Router } from 'express';
import wooCommerceApi from '../apiSetup/wooCommerceApi';

const router = Router();

// Fetch Products Route
router.get('/', async (req, res) => {
	const { page = 1, per_page = 30 } = req.query; // Default: page 1, 10 products per page

	try {
		const response = await wooCommerceApi.get(`/products`, {
			params: {
				page,
				per_page,
			},
		});

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
			},
		});
		res.json(response.data);
	} catch (error) {
		console.error('Error fetching products:', error.message);
		res.status(500).json({ error: 'Failed to fetch products' });
	}
});
router.get('/product/:id', async (req, res) => {
	const { id } = req.params;

	try {
		const response = await wooCommerceApi.get(`/products/${id}`);
		res.json(response.data);
	} catch (error) {
		console.error('Error fetching product:', error.message);
		res.status(500).json({ error: 'Failed to fetch product' });
	}
});

export default router;
