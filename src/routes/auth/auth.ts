import wooCommerceApi from '../../apiSetup/wooCommerceApi';

const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET; // Ensure you have this in your .env file

const router = express.Router();
require('dotenv').config();

const WOO_BASE_URL = process.env.WOO_BASE_URL;

const WP_URL = `${WOO_BASE_URL}/wp-json/jwt-auth/v1/token`;

//@ts-ignore
router.post('/login', async (req, res) => {
	const { username, password } = req.body;
	try {
		const response = await axios.post(WP_URL, {
			username,
			password,
		});

		const decode = jwt.decode(response.data.token, { complete: true });
		const id = decode.payload.data.user.id;
		const customer = await wooCommerceApi.get(`/customers/${id}`);
		const data = {
			token: response.data.token,
			user: customer.data,
		};
		return res.json(data); // Returns JWT Token
	} catch (error) {
		// console.log('Error:', error);
		return res.status(401).json({ message: 'Invalid credentials' });
	}
});

const WP_VALIDATE_URL = `${WOO_BASE_URL}/wp-json/jwt-auth/v1/token/validate`;

//@ts-ignore
router.get('/validate', async (req, res) => {
	const token = req.headers.authorization.split(' ')[1];
	// decode token
	try {
		const response = await axios.post(
			WP_VALIDATE_URL,
			{},
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);

		if (response.status === 200) {
			// Decode the token to get the user ID

			const d = jwt.decode(token, { complete: true }); // Decodes without verification
			const id = d.payload.data.user.id;
			// get user
			// user wocoomerce api
			const customer = await wooCommerceApi.get(`/customers/${id}`);

			// const data = user.data;
			// console.log('here', data.roles);
			return res.json({ valid: true, user: customer.data });
		} else {
			return res.status(response.status).json({ message: 'Invalid token' });
		}
	} catch (error) {
		return res.status(401).json({ message: 'Invalid token' });
	}
});

//write a jwt validation middleware
//@ts-ignore
export const validateToken = async (req, res, next) => {
	const token = req.headers.authorization.split(' ')[1];
	// decode token
	try {
		const response = await axios.post(
			WP_VALIDATE_URL,
			{},
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);

		if (response.status === 200) {
			// Decode the token to get the user ID
			next();
		} else {
			return res.status(response.status).json({ message: 'Invalid token' });
		}
	} catch (error) {
		return res.status(401).json({ message: 'Invalid token' });
	}
};

//write a register route

//@ts-ignore
router.post('/register', async (req, res) => {
	const { username, email, password, firstName, lastName } = req.body;
	try {
		const response = await axios.post(
			`${WOO_BASE_URL}/wp-json/wp/v2/users/register`,
			{
				username,
				email,
				password,
			}
		);

		return res.json(response.data);
	} catch (error) {
		return res.status(401).json({ message: 'Invalid credentials' });
	}
});
export default router;
