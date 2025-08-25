// @ts-nocheck
// src/utils/wooCommerceApi.js
//dot env not working

import crypto from 'crypto';
import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';
import dotenv from 'dotenv';
import { paramsProduct } from '../routes/prodRoutes/prodUtils';

dotenv.config();

const consumerKey = process.env.WOO_CONSUMER_KEY;
const consumerSecret = process.env.WOO_CONSUMER_SECRET;

const accessToken = '';
const accessTokenSecret = '';

const api = new WooCommerceRestApi({
	url: `http://81.181.166.178:8013`,
	consumerKey: process.env.WOO_CONSUMER_KEY!,
	consumerSecret: process.env.WOO_CONSUMER_SECRET!,
	version: 'wc/v3',
});
// Request details

//NOT TOUCHING CUZ IT FUCKING WORKS
// Axios instance setup
const wooCommerceApi = api;

// fetch all products from WooCommerce //
export async function fetchWooCommerceProducts() {
	try {
		const response = await wooCommerceApi.get('/products');
		return response;
	} catch (error) {
		throw new Error(error);
	}
}
fetchWooCommerceProducts();
export default wooCommerceApi;
