"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const express_1 = require("express");
const wooCommerceApi_1 = __importDefault(require("../apiSetup/wooCommerceApi"));
const router = (0, express_1.Router)();
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { q } = req.query; // Get the search query from the URL
    if (!q) {
        return res.status(400).json({ message: 'Search query is required' });
    }
    try {
        // Fetch products from WooCommerce API based on the search query
        const response = yield wooCommerceApi_1.default.get('/products', {
            params: {
                search: q, // WooCommerce supports searching with the 'search' query param
                per_page: 10, // Limit the number of results per page (optional)
            },
        });
        // Return the search results
        res.json(response.data);
    }
    catch (error) {
        console.error(error);
        res
            .status(500)
            .json({ message: 'Error retrieving products from WooCommerce' });
    }
}));
exports.default = router;
