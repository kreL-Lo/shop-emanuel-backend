import { Router } from 'express';
import wooCommerceApi from '../../apiSetup/wooCommerceApi';
import { Category } from '../../types/category';
const route = Router();

route.get('/stats', async (req, res) => {
	//get highest product price
	try {
		const highestPrice = await wooCommerceApi.get('products', {
			orderby: 'price',
			order: 'desc',
			per_page: 1,
		});

		const maxPrice = highestPrice.data[0].price;

		//get all categories
		const categoriesgory = await wooCommerceApi.get('products/categories', {
			per_page: 100,
		});

		const dataCat = categoriesgory.data as Category[];

		//get all parentes
		const parentCategories = dataCat.filter((cat) => cat.parent === 0);

		const dataCategories = parentCategories.map((cat) => {
			return {
				id: cat.id,
				name: cat.name,
				children: dataCat
					.filter((child) => child.parent === cat.id)
					.map((child) => {
						return {
							id: child.id,
							name: child.name,
						};
					}),
			};
		});

		const payload = {
			maxPrice,
			// @ts-ignore
			categories: dataCategories,
		};

		res.status(200).json(payload);
	} catch (err) {
		res.status(500).json({ error: `Error in fetchin filter stats` });
	}
});

export default route;
