"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const categories_1 = __importDefault(require("./categories/categories"));
const productRoutes_1 = __importDefault(require("./productRoutes"));
const search_products_1 = __importDefault(require("./search-products"));
const cart_1 = __importDefault(require("./cart/cart"));
const router = (0, express_1.Router)();
router.use('/categories', categories_1.default);
router.use('/products', productRoutes_1.default);
router.use('/search-products', search_products_1.default);
router.use('/cart', cart_1.default);
exports.default = router;
