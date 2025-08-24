// @ts-nocheck
// src/utils/wooCommerceApi.js
//dot env not working

import oauth from 'oauth-1.0a';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';
import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';

const consumerKey = process.env.WOO_CONSUMER_KEY;
const consumerSecret = process.env.WOO_CONSUMER_SECRET;

const accessToken = '';
const accessTokenSecret = '';

const oauth1 = oauth({
	consumer: { key: consumerKey, secret: consumerSecret },
	token: { key: accessToken, secret: accessTokenSecret },
	signature_method: 'HMAC-SHA1',
	hash_function: (base_string, key) =>
		crypto.createHmac('sha1', key).update(base_string).digest('base64'),
});

const api = new WooCommerceRestApi({
	url: process.env.WOO_BASE_URL!,
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
		const response = await wooCommerceApi.get('products');
		console.log('WooCommerce Products:', response.data);
		return response;
	} catch (error) {
		throw new Error(error);
	}
}
fetchWooCommerceProducts();
export default wooCommerceApi;
