import { Router } from 'express';
import wooCommerceApi from '../../apiSetup/wooCommerceApi';

const router = Router();
// @ts-ignore
router.get('/', async (req, res) => {
	try {
		const response = wooCommerceApi.get('products/categories');

		const data = await response;

		return res.json(data.data);
	} catch (error) {
		//
		res.status(500).json({ error: 'Failed to fetch products' });
	}
});

export default router;
