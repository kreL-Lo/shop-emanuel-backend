import wooCommerceApi from '../../apiSetup/wooCommerceApi';
import { Product } from '../../types/product';

const findProductVariation = async (product: Product) => {
	if (product.type === 'variable') {
		// firt variation from list
		const variationId = product.variations[0];
		const response = await wooCommerceApi.get(
			`/products/${product.id}/variations/${variationId}`
		);
		//@ts-ignore
		product.displayVariation = response.data;
	}
};

const findProductsVariations = async (products: Product[]) => {
	await Promise.all(products.map(findProductVariation));
};

export default findProductsVariations;
