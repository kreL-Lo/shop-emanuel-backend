"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/utils/wooCommerceApi.js
const axios_1 = __importDefault(require("axios"));
// Utility functions for case transformation
function camelToSnakeCase(obj) {
    if (Array.isArray(obj)) {
        return obj.map((v) => camelToSnakeCase(v));
    }
    else if (obj !== null && obj.constructor === Object) {
        return Object.keys(obj).reduce((result, key) => {
            const newKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
            result[newKey] = camelToSnakeCase(obj[key]);
            return result;
        }, {});
    }
    return obj;
}
function snakeToCamelCase(obj) {
    if (Array.isArray(obj)) {
        return obj.map((v) => snakeToCamelCase(v));
    }
    else if (obj !== null && obj.constructor === Object) {
        return Object.keys(obj).reduce((result, key) => {
            const newKey = key.replace(/(_\w)/g, (match) => match[1].toUpperCase());
            result[newKey] = snakeToCamelCase(obj[key]);
            return result;
        }, {});
    }
    return obj;
}
// Axios instance setup
const wooCommerceApi = axios_1.default.create({
    baseURL: process.env.NEXT_PUBLIC_WOO_BASE_URL,
    auth: {
        username: process.env.NEXT_PUBLIC_WOO_CONSUMER_KEY || '',
        password: process.env.NEXT_PUBLIC_WOO_CONSUMER_SECRET || '',
    },
});
// Request interceptor for POST and PUT to convert camelCase to snake_case
wooCommerceApi.interceptors.request.use((config) => {
    if (['post', 'put'].includes(config.method)) {
        config.data = camelToSnakeCase(config.data);
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});
// Response interceptor for GET to convert snake_case to camelCase
wooCommerceApi.interceptors.response.use((response) => {
    if (response.config.method === 'get') {
        response.data = snakeToCamelCase(response.data);
    }
    return response;
}, (error) => {
    return Promise.reject(error);
});
exports.default = wooCommerceApi;
