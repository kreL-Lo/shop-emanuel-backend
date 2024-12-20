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
exports.decryptOrderId = exports.encryptOrderId = void 0;
const express_1 = require("express");
const crypto_1 = __importDefault(require("crypto"));
const dotenv_1 = __importDefault(require("dotenv"));
const wooCommerceApi_1 = __importDefault(require("../../apiSetup/wooCommerceApi"));
dotenv_1.default.config();
const key = Buffer.from(process.env.ORDER_ENCRIPTION_KEY || '', 'hex');
const encryptOrderId = (orderId) => {
    const iv = crypto_1.default.randomBytes(16); // Generate a 16-byte initialization vector
    const cipher = crypto_1.default.createCipheriv('aes-256-cbc', key, iv);
    // Convert orderId to a string
    const orderIdString = orderId.toString();
    let encrypted = cipher.update(orderIdString, 'utf-8'); // Ensure 'utf-8' encoding
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    // Return the IV along with the encrypted data
    const f = `${iv.toString('hex')}:${encrypted.toString('hex')}`;
    return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
};
exports.encryptOrderId = encryptOrderId;
const decryptOrderId = (encryptedOrderId) => {
    const [ivHex, encryptedHex] = encryptedOrderId.split(':'); // Split the IV and encrypted data
    const iv = Buffer.from(ivHex, 'hex');
    const encryptedData = Buffer.from(encryptedHex, 'hex');
    const decipher = crypto_1.default.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedData);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString('utf-8');
};
exports.decryptOrderId = decryptOrderId;
const router = (0, express_1.Router)();
router.get('/order/:orderKey', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orderKey = req.params.orderKey.toString();
        const orderId = (0, exports.decryptOrderId)(orderKey);
        // get order
        const order = yield wooCommerceApi_1.default.get(`orders/${orderId}`);
        const { data, } = order;
        let products = [];
        if (data.line_items) {
            products = yield wooCommerceApi_1.default.get('products', {
                params: {
                    include: data.line_items.map((item) => item.product_id).join(','),
                },
            });
            //@ts-ignore
            products = products.data.map((product) => {
                var _a;
                //@ts-ignore
                const quantity = (_a = data.line_items.find((item) => item.product_id === product.id)) === null || _a === void 0 ? void 0 : _a.quantity;
                return Object.assign(Object.assign({}, product), { quantity: quantity || 0 });
            });
        }
        res.send({
            order: {
                total: data.total,
                status: data.status,
                shipping: data.shipping,
                billing: data.billing,
                payment_method: data.payment_method,
                payment_method_title: data.payment_method_title,
                products: products,
            },
        });
    }
    catch (e) {
        console.log(e);
        // @ts-ignore
        res.status(500).send({ error: e.message });
    }
}));
// export router
exports.default = router;
