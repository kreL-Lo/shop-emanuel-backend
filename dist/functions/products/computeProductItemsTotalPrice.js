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
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeProductsTotalPrice = void 0;
const products_1 = require("./products");
const computeProductsTotalPrice = (productItems) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!productItems) {
            return 0;
        }
        const productIds = productItems.map((product) => product.productId);
        const allProducts = yield (0, products_1.getAllProducts)(productIds);
        const total = productItems.reduce((acc, product) => {
            // @ts-ignore
            const productData = allProducts.find((p) => p.id === product.productId);
            if (!productData) {
                return acc;
            }
            return acc + productData.price * product.quantity;
        }, 0);
        return total * 100;
    }
    catch (e) {
        throw new Error(`Failed to compute total price ${e}`);
    }
});
exports.computeProductsTotalPrice = computeProductsTotalPrice;
