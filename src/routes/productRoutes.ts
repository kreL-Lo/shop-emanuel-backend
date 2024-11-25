// @ts-nocheck
import { Router } from 'express';
import wooCommerceApi from '../apiSetup/wooCommerceApi';

const router = Router();

// Fetch Products Route
router.get('/', async (req, res) => {
	try {
		const response = await wooCommerceApi.get('/products');
		res.json(response.data);
	} catch (error) {
		//
		console.log('here', error);
		console.error('Error fetching products:', error.message);
		res.status(500).json({ error: 'Failed to fetch products' });
	}
});

router.get('/noutati', async (req, res) => {
	try {
		const response = await wooCommerceApi.get('/products', {
			params: {
				category: 15,
			},
		});
		res.json(response.data);
	} catch (error) {
		console.error('Error fetching products:', error.message);
		res.status(500).json({ error: 'Failed to fetch products' });
	}
});

export default router;
