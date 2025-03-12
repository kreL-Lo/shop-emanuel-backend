import wooCommerceApi from '../../apiSetup/wooCommerceApi';

const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config();

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

export const isValidToken = async (req) => {
	try {
		const token = req.headers.authorization.split(' ')[1];
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
			//put user in req
			const d = jwt.decode(token, { complete: true });
			const id = d.payload.data.user.id;
			const data = await wooCommerceApi.get(`/customers/${id}`);
			req['userId'] = id;
			req['user'] = data.data;
			return true;
		} else {
			return false;
		}
	} catch (error) {
		return false;
	}
};
// @ts-ignore
export const validateToken = async (req, res, next) => {
	// decode token
	try {
		const token = req.headers.authorization.split(' ')[1];
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
			// put the id in the request
			req['userId'] = id;
			const data = await wooCommerceApi.get(`/customers/${id}`);
			req['user'] = data.data;
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
	const { email, password, firstName, lastName } = req.body;
	try {
		//create a woo commerce customer
		const response = await wooCommerceApi.post('/customers', {
			email,
			password,
			first_name: firstName,
			last_name: lastName,
		});
		// create token
		const responseToken = await axios.post(WP_URL, {
			username: email,
			password,
		});

		return res.json({
			token: responseToken.data.token,
			user: response.data,
		});
	} catch (error) {
		console.log('here', error);
		return res.status(401).json({ message: 'Invalid credentials' });
	}
});
export default router;
