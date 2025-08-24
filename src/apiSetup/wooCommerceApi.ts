// @ts-nocheck
// src/utils/wooCommerceApi.js

import oauth from 'oauth-1.0a';
import crypto from 'crypto';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

/**
 * .env required:
 *   WOO_BASE_URL=https://yourstore.com        (no trailing slash)
 *   WOO_CONSUMER_KEY=ck_xxx
 *   WOO_CONSUMER_SECRET=cs_xxx
 * Optional:
 *   WOO_AUTH_MODE=oauth | query               (default: oauth)
 *   WOO_DEBUG=1                               (log what we sign/send)
 */

const BASE = (process.env.WOO_BASE_URL || '').trim().replace(/\/+$/, '');
const CK = (process.env.WOO_CONSUMER_KEY || '').trim();
const CS = (process.env.WOO_CONSUMER_SECRET || '').trim();
const MODE = (process.env.WOO_AUTH_MODE || 'oauth').trim().toLowerCase();
const DEBUG = process.env.WOO_DEBUG === '1';

if (!BASE || !CK || !CS) {
	throw new Error(
		'Missing WOO_BASE_URL / WOO_CONSUMER_KEY / WOO_CONSUMER_SECRET in .env'
	);
}

// Build the canonical REST base URL
const REST_BASE = `${BASE}/wp-json/wc/v3`;

// ---- Helper: create OAuth 1.0a signer (no access token for Woo REST keys) ----
const oauth1 = oauth({
	consumer: { key: CK, secret: CS },
	signature_method: 'HMAC-SHA1',
	hash_function: (base_string, key) =>
		crypto.createHmac('sha1', key).update(base_string).digest('base64'),
});

// ---- Create axios instance ----
const wooCommerceApi = axios.create({
	baseURL: REST_BASE,
	// You can set common headers here if needed; don't set Authorization for OAuth mode.
});

// ---- Auth mode: simple query params (HTTPS only; officially supported by Woo) ----
if (MODE === 'query') {
	// Attach key/secret to every request as query parameters
	wooCommerceApi.interceptors.request.use((request) => {
		// Respect an explicit request.baseURL/url; then merge params.
		const base = request.baseURL || REST_BASE;
		const path = request.url || '';
		const url = new URL(path, base);

		// Merge caller params first
		if (request.params) {
			for (const [k, v] of Object.entries(request.params)) {
				if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
			}
			request.params = undefined;
		}

		// Add Woo creds
		url.searchParams.set('consumer_key', CK);
		url.searchParams.set('consumer_secret', CS);

		// Finalize URL for axios (keep only path+query so axios doesn’t double-base)
		request.url = url.pathname + url.search;

		if (DEBUG) {
			console.log(
				'[WOOCOMMERCE DEBUG][query] method:',
				(request.method || 'GET').toUpperCase()
			);
			console.log('[WOOCOMMERCE DEBUG][query] final url:', url.toString());
		}

		return request;
	});
}

// ---- Auth mode: OAuth 1.0a with query-string parameters (no headers) ----
if (MODE === 'oauth') {
	wooCommerceApi.interceptors.request.use((request) => {
		const base = request.baseURL || REST_BASE;
		const path = request.url || '';
		const url = new URL(path, base);

		// 1) Move any caller-supplied params into URL before signing
		if (request.params) {
			for (const [k, v] of Object.entries(request.params)) {
				if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
			}
			request.params = undefined; // avoid axios re-adding them post-sign
		}

		// 2) Decide whether the request body participates in the signature
		const method = (request.method || 'get').toUpperCase();
		const hdrs = request.headers || {};
		const ct = (hdrs['Content-Type'] || hdrs['content-type'] || '').toString();
		const isForm = ct.includes('application/x-www-form-urlencoded');

		let dataForSigning = undefined;
		if (isForm && request.data && typeof request.data === 'object') {
			// Only form-encoded bodies are included in OAuth 1.0a signature
			dataForSigning = request.data;
		}

		// 3) Sign the *exact* URL we will request (including query params)
		const oauthParams = oauth1.authorize(
			{
				url: url.toString(),
				method,
				data: dataForSigning,
			}
			// No token param for Woo REST keys
		);

		// 4) Put OAuth params into the query string (Woo expects this)
		for (const [k, v] of Object.entries(oauthParams)) {
			url.searchParams.set(k, v);
		}

		// 5) Finalize request URL (path + query only, axios keeps baseURL)
		request.url = url.pathname + url.search;

		if (DEBUG) {
			console.log('[WOOCOMMERCE DEBUG][oauth] method:', method);
			console.log('[WOOCOMMERCE DEBUG][oauth] signed url:', url.toString());
			if (isForm)
				console.log('[WOOCOMMERCE DEBUG][oauth] form data:', request.data);
		}

		return request;
	});
}

// ---- Optional convenience wrappers (use or delete) ----
export const wcGet = (path, params) => wooCommerceApi.get(path, { params });
export const wcPost = (path, data, config) =>
	wooCommerceApi.post(path, data, config);
export const wcPut = (path, data, config) =>
	wooCommerceApi.put(path, data, config);
export const wcDelete = (path, config) => wooCommerceApi.delete(path, config);

export default wooCommerceApi;

/**
 * Quick sanity test you can run somewhere in your app:
 *
 *   import woo from './utils/wooCommerceApi';
 *   // Should return 1 product (if any exist) without "Invalid signature"
 *   woo.get('/products', { params: { per_page: 1 } })
 *      .then(r => console.log(r.data))
 *      .catch(e => console.error(e.response?.data || e.message));
 *
 * Common pitfalls this file avoids:
 *  - OAuth params in Authorization header (Woo wants them in the URL).
 *  - Including an oauth_token (not used by Woo REST keys).
 *  - Signing a different URL than you send (query params mismatch).
 *  - Including JSON bodies in the signature (don’t; only form-encoded).
 *  - Whitespace/newlines in env values (we trim).
 *  - Trailing slashes / implicit ports / http↔https mismatches.
 */
