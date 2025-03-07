// @ts-nocheck
import { Router } from 'express';
import wooCommerceApi from '../apiSetup/wooCommerceApi';
import { paramsProduct } from './prodRoutes/prodUtils';

const router = Router();
router.get('/', async (req, res) => {
	const { q } = req.query; // Get the search query from the URL

	if (!q) {
		return res.status(400).json({ message: 'Search query is required' });
	}

	try {
		// Fetch products from WooCommerce API based on the search query
		const response = await wooCommerceApi.get('/products', {
			params: {
				search: q, // WooCommerce supports searching with the 'search' query param
				per_page: 10, // Limit the number of results per page (optional)
				...paramsProduct,
			},
		});

		// Return the search results
		res.json(response.data);
	} catch (error) {
		console.error(error);
		res
			.status(500)
			.json({ message: 'Error retrieving products from WooCommerce' });
	}
});
export default router;
