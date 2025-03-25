import { Router } from 'express';
import wooCommerceApi from '../../apiSetup/wooCommerceApi';
import { ProductVariation } from '../../types/productVariation';
import { Product } from '../../types/product';
import findProductsVariations from '../../functions/products/findProductVariation';

const router = Router();

/*
Given an array of product ids give me the products and also calculate the sum of the price
use Woo commerce api to get the products and their prices
*/

router.post('/items', async (req, res) => {
	try {
		const items: [
			{
				productId: number;
				variationId: number;
			}
		] = req.body.items;
		const allProductId = items.map((item) => item.productId);
		const productItems: { [key: number]: number[] } = {};

		for (let i = 0; i < items.length; i++) {
			if (productItems[items[i].productId]) {
				productItems[items[i].productId].push(items[i].variationId);
			} else {
				productItems[items[i].productId] = [items[i].variationId];
			}
		}

		//get all products

		//get all products
		const products: { data: [Product] } = await wooCommerceApi.get(
			'/products',
			{
				params: {
					include: allProductId.join(','),
				},
				//@ts-ignore
			}
		);

		//get all products variation

		//
		const data = await Promise.all(
			products.data.map(async (product) => {
				//fetch variations
				// @ts-ignore
				product.cartVariations = [];

				// @ts-ignore
				const variations: { data: [ProductVariation] } = await wooCommerceApi
					.get(`/products/${product.id}/variations`, {
						params: {
							include: productItems[product.id].join(','),
						},
						//@ts-ignore
					})
					.catch((e) => {
						return product;
					});
				//@ts-ignore
				product.cartVariations = variations.data;

				// @ts-ignore
				if (product.status === 'private') {
					//get all groupped products

					// 					// here [ { id: 4859, key: 'linkedIds', value: [ [Object] ] } ]
					const meta =
						product.meta_data.find((meta: any) => meta.key === 'linkedIds') ||
						[];

					const ids = meta.value;

					const groupedProducts = await wooCommerceApi.get('/products', {
						params: {
							include: ids.join(','),
						},
					});

					await findProductsVariations(groupedProducts.data);
					product.groupedProducts = groupedProducts.data || [];
					// here [ { id: 4859, key: 'quantity', value: [ [Object] ] } ]
					//@ts-ignore
					product?.groupedProducts.forEach((groupedProduct: any) => {
						const quantity = product.meta_data.find(
							(meta: any) => meta.key === 'quantity'
						);
						// @ts-ignore
						groupedProduct.quantity =
							quantity?.value.find(
								(value: any) => value.id === groupedProduct.id
							)?.quantity || 0;

						groupedProduct.quantity = Number(groupedProduct.quantity);
					});
				}
				return product;
			})
		);

		//make sure they all fit the same format

		const productsToFormat = items.map((item) => {
			const product = data.find((product) => product.id === item.productId);
			//@ts-ignore
			const variation = product.cartVariations.find(
				(variation: any) => variation.id === item.variationId
			);
			//@ts-ignore
			const clonedProduct = { ...product, cartVariation: variation };
			return clonedProduct;
		});

		res.status(200).send({ products: productsToFormat });
	} catch (e) {
		console.log(e);
		res.status(500).send('Internal Server Error');
	}
});

export default router;
