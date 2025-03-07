// @ts-nocheck
// src/utils/wooCommerceApi.js
//dot env not working

import oauth from 'oauth-1.0a';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

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

// Request details

//NOT TOUCHING CUZ IT FUCKING WORKS
// Axios instance setup
const wooCommerceApi = axios.create({
	baseURL: `${process.env.WOO_BASE_URL}/wp-json/wc/v3`,
	// auth: {
	// 	username: process.env.WOO_CONSUMER_KEY || '',
	// 	password: process.env.WOO_CONSUMER_SECRET || '',
	// },
});
//TODO: uncomment this when production
// Add OAuth1 interceptor to the Axios instance
wooCommerceApi.interceptors.request.use(
	(request) => {
		// Prepare the request parameters for OAuth

		const urlWithParams = new URL(request.baseURL + request.url); // Start with the baseURL and request.url
		if (request.params) {
			Object.keys(request.params).forEach((key) => {
				urlWithParams.searchParams.append(key, request.params[key]);
			});
		}

		const requestData = {
			url: urlWithParams.toString(),
			method: request.method.toUpperCase(),
		};

		// Generate OAuth1 signature for the request
		const oauthHeaders = oauth1.toHeader(oauth1.authorize(requestData));

		// Add OAuth headers to the request
		request.headers = oauthHeaders;

		return request;
	},
	(error) => {
		return Promise.reject(error);
	}
);

export default wooCommerceApi;
