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
const express_1 = require("express");
const wooCommerceApi_1 = __importDefault(require("../../apiSetup/wooCommerceApi"));
const router = (0, express_1.Router)();
/*
Given an array of product ids give me the products and also calculate the sum of the price
use Woo commerce api to get the products and their prices
*/
router.post('/items', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { productIds } = req.body;
        const products = yield wooCommerceApi_1.default.get('/products', {
            params: {
                include: productIds.join(','),
            },
        });
        res.status(200).send({ products: products.data });
    }
    catch (e) {
        console.log(e);
        res.status(500).send('Internal Server Error');
    }
}));
exports.default = router;
