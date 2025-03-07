import { Router } from 'express';
import { buildInfoGraph, InfoGraph, values } from './utils';
import wooCommerceApi from '../../apiSetup/wooCommerceApi';
import { Product } from '../../types/product';

const router = Router();

const activeBatteryData = async (activeBat: number) => {
	const value = values[activeBat];

	if (value) {
		if (value?.skuTag) {
			//get product with skuTag
			const data = await wooCommerceApi.get(`/products?sku=${value.skuTag}`);

			if (data.data.length > 0) {
				return data.data[0];
			}
		}
	}

	return null;
};

const buildProducts = async (data: InfoGraph) => {
	//count number of items in battery layout
	const infoGraph = buildInfoGraph(data, false);
	const abd = await activeBatteryData(data.activeBattery);
	// @ts-ignore
	const products: [] = [];
	if (abd) {
		const numCells = infoGraph.nrDeCelule || 0;

		const activeBattery = {
			...abd,
			dbQuantity: numCells,
		};
		//@ts-ignore
		products.push(activeBattery);
	}
	return products;
};

const costProduse = (products: Product[]) => {
	return products.reduce((acc, product) => {
		// @ts-ignore
		return acc + product.price * product?.dbQuantity;
	}, 0);
};
const costManopera = (totalCost: number) => {
	return totalCost * 0.1;
};
router.post('/products', async (req, res) => {
	try {
		const data: InfoGraph = req.body;
		const payload = {
			products: [],
			totalCost: 0,
			costProduse: 0,
			costManopera: 0,
		};

		// @ts-ignore

		payload['products'] = await buildProducts(data);
		// @ts-ignore
		const cProduse = costProduse(payload?.products);
		const cManopera = costManopera(cProduse);
		payload['totalCost'] = cProduse + cManopera;
		payload['costProduse'] = cProduse;
		payload['costManopera'] = cManopera;
		res.status(200).json(payload);
	} catch (e: any) {
		//
		console.log('here', e);
		res.status(500).json({ error: e?.message });
	}
});

export default router;
