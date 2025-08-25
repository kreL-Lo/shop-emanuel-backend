import wooCommerceApi from '../../apiSetup/wooCommerceApi';
import { Order } from '../../types/order';

export const updateOrderLineItems = async (
	bundleItems: any[],
	orderId: string
) => {
	const order = await wooCommerceApi.get(`orders/${orderId}`);
	const orderPayload = order.data as Order;

	const existingOrderItems = order.data.line_items.map((item: any) => ({
		id: item.id,
		quantity: 0, // Placeholder, will be removed before sending
	}));

	const newItems = orderPayload.line_items?.map((item) => {
		let key = `${item.product_id}`;
		if (item.variation_id) {
			key = `${item.product_id}-${item.variation_id}`;
		}
		const bundleItem = bundleItems.find((bundleItem) => bundleItem.id === key);
		if (bundleItem) {
			if (item.price) {
				// @ts-ignore
				item.total = Number(item.price) * Number(item.quantity) * 0.95;
				// @ts-ignore
				item.total = item.total.toFixed(2);
				item.subtotal = item.total;
			}
		}

		return { ...item };
	});
	const newItemsWithoutId = newItems?.map((item) => {
		if (item.variation_id) {
			return {
				product_id: item.product_id,
				variation_id: item.variation_id,
				quantity: item.quantity,
				price: item.price,
				total: item.total,
			};
		}
		return {
			product_id: item.product_id,
			quantity: item.quantity,
			price: item.price,
			total: item.total,
		};
	});
	// patch woocommerce order
	await wooCommerceApi.put(`/orders/${orderId}`, {
		// @ts-ignore
		line_items: [...existingOrderItems, ...newItemsWithoutId],
	});
};
