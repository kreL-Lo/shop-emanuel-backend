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
exports.updateWooCommerceOrderStatus = void 0;
const wooCommerceApi_1 = __importDefault(require("../../apiSetup/wooCommerceApi"));
const updateWooCommerceOrderStatus = (_a) => __awaiter(void 0, [_a], void 0, function* ({ orderId, status, }) {
    console.log('Updating WooCommerce order:', orderId);
    try {
        // WooCommerce API request
        wooCommerceApi_1.default.put(`orders/${orderId}`, {
            status: status,
        });
    }
    catch (error) {
        throw new Error('Failed to update WooCommerce order');
    }
});
exports.updateWooCommerceOrderStatus = updateWooCommerceOrderStatus;
