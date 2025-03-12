import wooCommerceApi from '../../apiSetup/wooCommerceApi';
import { Customer } from '../../types/customer';
import { Order } from '../../types/order';
import { ProductItem } from '../products/computeProductItemsTotalPrice';

export const createWooCommerceOrder = async ({
	items,
	totalPrice,
	user,
}: {
	items: ProductItem[];
	totalPrice: number;
	user?: Customer;
}): Promise<Order> => {
	console.log('here', user);
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
			line_items: items.map((item) => {
				if (item.variationId) {
					return {
						product_id: item.productId,
						quantity: item.quantity,
						variation_id: item.variationId,
					};
				}
				return {
					product_id: item.productId,
					quantity: item.quantity,
				};
			}),
		};
		if (user) {
			orderData.customer_id = user.id;
		}
		const response = await wooCommerceApi.post('/orders', orderData);
		// @ts-ignore
		return response.data; // Return the WooCommerce order ID
	} catch (error) {
		throw new Error('Failed to create WooCommerce order');
	}
};
