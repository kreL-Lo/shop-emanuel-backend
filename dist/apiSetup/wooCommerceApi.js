"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
// src/utils/wooCommerceApi.js
//dot env not working
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const axios_1 = __importDefault(require("axios"));
// Axios instance setup
const wooCommerceApi = axios_1.default.create({
    baseURL: `${process.env.WOO_BASE_URL}/wp-json/wc/v3`,
    auth: {
        username: process.env.WOO_CONSUMER_KEY || '',
        password: process.env.WOO_CONSUMER_SECRET || '',
    },
});
exports.default = wooCommerceApi;
