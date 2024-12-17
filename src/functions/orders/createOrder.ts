import wooCommerceApi from '../../apiSetup/wooCommerceApi';
import { Order } from '../../types/order';
import { ProductItem } from '../products/computeProductItemsTotalPrice';

export const createWooCommerceOrder = async ({
	items,
	totalPrice,
}: {
	items: ProductItem[];
	totalPrice: number;
}): Promise<Order> => {
	try {
		const orderData: Order = {
			payment_method: 'card', // Payment method (change as needed)
			payment_method_title: 'Init Payment',
			set_paid: false, // Set to false until payment is confirmed
			shipping: {
				first_name: '',
				last_name: '',
				address_1: '',
				city: '',
				postcode: '',
				country: '',
			},
			// @ts-ignore
			line_items: items.map((item) => ({
				product_id: item.productId,
				quantity: item.quantity,
			})),
			price: totalPrice,
		};

		const response = await wooCommerceApi.post('orders', orderData);
		// @ts-ignore
		return response.data; // Return the WooCommerce order ID
	} catch (error) {
		console.error('Error creating WooCommerce order:', error);
		throw new Error('Failed to create WooCommerce order');
	}
};
