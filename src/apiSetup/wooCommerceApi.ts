// @ts-nocheck
// src/utils/wooCommerceApi.js
//dot env not working
import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

// Axios instance setup
const wooCommerceApi = axios.create({
	baseURL: `${process.env.WOO_BASE_URL}/wp-json/wc/v3`,
	auth: {
		username: process.env.WOO_CONSUMER_KEY || '',
		password: process.env.WOO_CONSUMER_SECRET || '',
	},
});

export default wooCommerceApi;
