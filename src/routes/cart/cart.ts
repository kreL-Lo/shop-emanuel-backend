import { Router } from 'express';
import wooCommerceApi from '../../apiSetup/wooCommerceApi';

const router = Router();

/*
Given an array of product ids give me the products and also calculate the sum of the price
use Woo commerce api to get the products and their prices
*/

router.post('/items', async (req, res) => {
	try {
		const { productIds } = req.body;

		const products = await wooCommerceApi.get('/products', {
			params: {
				include: productIds.join(','),
			},
		});
		res.status(200).send({ products: products.data });
	} catch (e) {
		console.log(e);
		res.status(500).send('Internal Server Error');
	}
});

export default router;
