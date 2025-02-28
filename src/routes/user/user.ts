import express from 'express';
import wooCommerceApi from '../../apiSetup/wooCommerceApi';
import { validateToken } from '../auth/auth';

const router = express.Router();

// populate user data

router.get('/user', validateToken, async (req, res) => {
	//@ts-ignore
	const id = req.userId;
	try {
		const response = await wooCommerceApi.get(`/customers/${id}`);
		res.json(response.data);
	} catch (error) {
		//@ts-ignore
		console.error('Error fetching user:', error.message);
		res.status(500).json({ error: 'Failed to fetch user' });
	}
});

export default router;
