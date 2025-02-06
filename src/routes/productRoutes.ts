// @ts-nocheck
import { Router } from 'express';
import wooCommerceApi from '../apiSetup/wooCommerceApi';

const router = Router();
const MENU_ITEMS = {
	BMS: 'bms',
	SUPORTI_CARCASE: 'suporti_carcase',
	PLAT_BANDA: 'plat-banda',
	ECHIPAMENTE: 'echipamente',
	CELULE: 'celule',
	BATERII_MOPED: 'baterii-moped',
	SUDURA_PUNCTE: 'sudura-puncte',
	INCARCATOARE: 'incarcatoare',
	CABLU_CONECTORI: 'cablu-conectori',
	PROTECTIE_AMBALARE: 'protectie-ambalare',
	TESTERE_BATERII: 'tester-baterii',
};

// Fetch Products Route
router.get('/search/:name', async (req, res) => {
	const { page = 1, per_page = 20 } = req.query; // Default: page 1, 10 products per page
	const { name } = req.params;
	// get the rest of url ?category= value
	const { category } = req.query;

	let validCategory = null;
	if (category) {
		//find in menu types
		if (MENU_ITEMS[category]) {
			validCategory = { slug: MENU_ITEMS[category] };
		}
	}
	try {
		const params = {
			search: name,
			page,
			per_page,
		};

		if (name === 'all') {
			params.search = '';
		}

		// Add category to the parameters if valid
		if (validCategory) {
			params.category = validCategory.slug;
		}

		const response = await wooCommerceApi.get(
			`/products?page=${page}&per_page=${per_page}`,
			{ params }
		);
		const url = `/products?page=${page}&per_page=${per_page}`;
		console.lo;
		// Send WooCommerce response to the client
		res.status(200).json({
			page: parseInt(page),
			per_page: parseInt(per_page),
			total: parseInt(response.headers['x-wp-total']),
			total_pages: parseInt(response.headers['x-wp-totalpages']),
			products: response.data,
		});
	} catch (error) {
		console.error('Error fetching products:', error.message);
		res.status(error.response?.status || 500).json({
			error: error.message || 'Internal Server Error',
		});
	}
});

router.get('/noutati', async (req, res) => {
	console.log('here');
	try {
		const response = await wooCommerceApi.get('/products', {
			// limit to 10 products
			// first 10 products
			params: {
				per_page: 10, // Limit to 10 products
				orderby: 'date', // Order by creation date
				order: 'desc', // Descending order (most recent first)
			},
		});
		res.json(response.data);
	} catch (error) {
		console.error('Error fetching products:', error.message);
		res.status(500).json({ error: 'Failed to fetch products' });
	}
});
router.get('/product/:id', async (req, res) => {
	const { id } = req.params;
	try {
		const response = await wooCommerceApi.get(`/products/${id}`);
		res.json(response.data);
	} catch (error) {
		console.error('Error fetching product:', error.message);
		res.status(500).json({ error: 'Failed to fetch product' });
	}
});

// get all orders and products
async function cleanOrders() {
	//get all orders
	try {
		console.log('here beging clean orders');
		const response = await wooCommerceApi.get(`/orders`, {
			params: {
				per_page: 50,
			},
		});
		const orders = response.data;

		await orders.forEach(async (order) => {
			const id = order.id;
			console.log('cleaning order', id);
			const response = await wooCommerceApi.delete(`/orders/${id}`, {
				force: true,
			});
		});
		console.log('here end clean orders');
	} catch (e) {
		console.log(e);
	}
}

async function cleanProducts() {
	try {
		console.log('here beging clean products');
		const response = await wooCommerceApi.get(`/products`, {
			params: {
				per_page: 100,
			},
		});
		const products = response.data;

		await products.forEach(async (product) => {
			const id = product.id;
			console.log('cleaning product', id);
			const response = await wooCommerceApi.delete(`/products/${id}`, {
				force: true,
			});
		});

		console.log('here end clean products');
	} catch (e) {
		console.log(e);
	}
}
export default router;
