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
// Fetch Products Route
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield wooCommerceApi_1.default.get('/products');
        res.json(response.data);
    }
    catch (error) {
        //
        console.log('here', error);
        console.error('Error fetching products:', error.message);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
}));
router.get('/noutati', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield wooCommerceApi_1.default.get('/products', {
            params: {
                category: 15,
            },
        });
        res.json(response.data);
    }
    catch (error) {
        console.error('Error fetching products:', error.message);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
}));
exports.default = router;
