// @ts-nocheck
// src/utils/wooCommerceApi.js
//dot env not working
import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

// Utility functions for case transformation
function camelToSnakeCase(obj: any) {
	if (Array.isArray(obj)) {
		return obj.map((v: any) => camelToSnakeCase(v));
	} else if (obj !== null && obj.constructor === Object) {
		return Object.keys(obj).reduce((result, key) => {
			const newKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
			result[newKey] = camelToSnakeCase(obj[key]);
			return result;
		}, {});
	}
	return obj;
}

function snakeToCamelCase(obj: any) {
	if (Array.isArray(obj)) {
		return obj.map((v: any) => snakeToCamelCase(v));
	} else if (obj !== null && obj.constructor === Object) {
		return Object.keys(obj).reduce((result, key) => {
			const newKey = key.replace(/(_\w)/g, (match) => match[1].toUpperCase());
			result[newKey] = snakeToCamelCase(obj[key]);
			return result;
		}, {});
	}
	return obj;
}

// Axios instance setup
const wooCommerceApi = axios.create({
	baseURL: `${process.env.WOO_BASE_URL}/wp-json/wc/v3`,
	auth: {
		username: process.env.WOO_CONSUMER_KEY || '',
		password: process.env.WOO_CONSUMER_SECRET || '',
	},
});

// Request interceptor for POST and PUT to convert camelCase to snake_case
wooCommerceApi.interceptors.request.use(
	(config: any) => {
		if (['post', 'put'].includes(config.method)) {
			config.data = camelToSnakeCase(config.data);
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// Response interceptor for GET to convert snake_case to camelCase
wooCommerceApi.interceptors.response.use(
	(response) => {
		if (response.config.method === 'get') {
			response.data = snakeToCamelCase(response.data);
		}
		return response;
	},
	(error) => {
		return Promise.reject(error);
	}
);

export default wooCommerceApi;
