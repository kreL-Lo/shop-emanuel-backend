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
exports.getAllProducts = void 0;
const wooCommerceApi_1 = __importDefault(require("../../apiSetup/wooCommerceApi"));
const getAllProducts = (productsIds) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const products = yield wooCommerceApi_1.default.get('products', {
            params: {
                include: productsIds.join(','),
            }
        });
        return products.data;
    }
    catch (error) {
        console.error('Error getting products:', error);
        throw new Error('Failed to get products');
    }
});
exports.getAllProducts = getAllProducts;
