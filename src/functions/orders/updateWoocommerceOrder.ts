import wooCommerceApi from '../../apiSetup/wooCommerceApi';
import { Order } from '../../types/order';

export const updateWooCommerceOrderStatus = async ({
	orderId,
	status,
}: {
	orderId: string;
	status: string;
}) => {
	console.log('Updating WooCommerce order:', orderId);
	try {
		// WooCommerce API request
		wooCommerceApi.put(`orders/${orderId}`, {
			status: status,
		});
	} catch (error) {
		throw new Error('Failed to update WooCommerce order');
	}
};
