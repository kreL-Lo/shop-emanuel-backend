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
exports.createWooCommerceOrder = void 0;
const wooCommerceApi_1 = __importDefault(require("../../apiSetup/wooCommerceApi"));
const createWooCommerceOrder = (_a) => __awaiter(void 0, [_a], void 0, function* ({ items, totalPrice, }) {
    try {
        const orderData = {
            payment_method: 'card', // Payment method (change as needed)
            payment_method_title: 'Init Payment',
            set_paid: false, // Set to false until payment is confirmed
            shipping: {
                first_name: '',
                last_name: '',
                address_1: '',
                city: '',
                postcode: '',
                country: '',
            },
            // @ts-ignore
            line_items: items.map((item) => ({
                product_id: item.productId,
                quantity: item.quantity,
            })),
            price: totalPrice,
        };
        const response = yield wooCommerceApi_1.default.post('orders', orderData);
        // @ts-ignore
        return response.data; // Return the WooCommerce order ID
    }
    catch (error) {
        console.error('Error creating WooCommerce order:', error);
        throw new Error('Failed to create WooCommerce order');
    }
});
exports.createWooCommerceOrder = createWooCommerceOrder;
