'use strict';
var __awaiter =
	(this && this.__awaiter) ||
	function (thisArg, _arguments, P, generator) {
		function adopt(value) {
			return value instanceof P
				? value
				: new P(function (resolve) {
						resolve(value);
				  });
		}
		return new (P || (P = Promise))(function (resolve, reject) {
			function fulfilled(value) {
				try {
					step(generator.next(value));
				} catch (e) {
					reject(e);
				}
			}
			function rejected(value) {
				try {
					step(generator['throw'](value));
				} catch (e) {
					reject(e);
				}
			}
			function step(result) {
				result.done
					? resolve(result.value)
					: adopt(result.value).then(fulfilled, rejected);
			}
			step((generator = generator.apply(thisArg, _arguments || [])).next());
		});
	};
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod };
	};
Object.defineProperty(exports, '__esModule', { value: true });
// @ts-nocheck
const express_1 = require('express');
const wooCommerceApi_1 = __importDefault(require('../apiSetup/wooCommerceApi'));
const router = (0, express_1.Router)();
// Fetch Products Route
router.get('/search/:name', (req, res) =>
	__awaiter(void 0, void 0, void 0, function* () {
		var _a;
		const { page = 1, per_page = 30 } = req.query; // Default: page 1, 10 products per page
		const { name } = req.params;
		try {
			const response = yield wooCommerceApi_1.default.get(`/products`, {
				params: {
					search: name,
					page,
					per_page,
				},
			});
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
			res
				.status(
					((_a = error.response) === null || _a === void 0
						? void 0
						: _a.status) || 500
				)
				.json({
					error: error.message || 'Internal Server Error',
				});
		}
	})
);
router.get('/noutati', (req, res) =>
	__awaiter(void 0, void 0, void 0, function* () {
		try {
			const response = yield wooCommerceApi_1.default.get('/products', {
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
	})
);
router.get('/product/:id', (req, res) =>
	__awaiter(void 0, void 0, void 0, function* () {
		const { id } = req.params;
		try {
			const response = yield wooCommerceApi_1.default.get(`/products/${id}`);
			res.json(response.data);
		} catch (error) {
			console.error('Error fetching product:', error.message);
			res.status(500).json({ error: 'Failed to fetch product' });
		}
	})
);
exports.default = router;
