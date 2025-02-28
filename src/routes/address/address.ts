import { Router } from 'express';
import wooCommerceApi from '../../apiSetup/wooCommerceApi';
import { validateToken } from '../auth/auth';

const router = Router();

router.post('/modify', validateToken, async (req, res) => {
	//upate the customer shipping address
	try {
		//@ts-ignore
		const id = req.userId;
		const response = await wooCommerceApi.put(`/customers/${id}`, req.body);
		res.json(response.data);
	} catch (error) {
		//@ts-ignore
		console.error('Error updating address:', error.message);
		res.status(500).json({ error: 'Failed to update address' });
	}
});

export default router;
