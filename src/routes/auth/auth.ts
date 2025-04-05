import {
	forgotPasswordTemplateEmail,
	registerTemplateEmail,
} from '../../apiSetup/emailSetup';
import wooCommerceApi from '../../apiSetup/wooCommerceApi';

const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const router = express.Router();
require('dotenv').config();

setTimeout(async () => {
	try {
		// const testMail = 'ciprian.miru@gmail.com';
		// const customer = await wooCommerceApi.get(`/customers?email=${testMail}`);
		// const id = customer.data[0].id;
		// await wooCommerceApi.put(`/customers/${id}`, {
		// 	meta_data: [
		// 		{
		// 			key: 'reset_password_count',
		// 			value: 0,
		// 		},
		// 	],
		// });
		// console.log('reset count to 0');
	} catch (e) {}
}, 2000);
const WOO_BASE_URL = process.env.WOO_BASE_URL;

const WP_URL = `${WOO_BASE_URL}/wp-json/jwt-auth/v1/token`;
const JWT_SECRET = process.env.JWT_SECRET_EMAIL;
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
		//check if user exists
		const response = await wooCommerceApi.get(`/customers?email=${email}`);
		if (response.data.length > 0) {
			return res.status(401).json({ message: 'Invalid' });
		}
		const token = jwt.sign(
			{ password, email, firstName, lastName },
			JWT_SECRET,
			{ expiresIn: '1h' }
		);

		registerTemplateEmail({
			name: firstName,
			email: email,
			url: 'https://atelieruldebaterii.ro/verify-email?token=' + token,
		});
		res.status(200).json({
			message: 'Email sent',
		});
	} catch (error) {
		return res.status(401).json({ message: 'Invalid credentials' });
	}
});

// @ts-ignore
router.post('/verify-email', async (req, res) => {
	const { token } = req.body;
	try {
		const decoded = jwt.verify(token, JWT_SECRET);
		const { email, password, firstName, lastName } = decoded;

		await wooCommerceApi.post('/customers', {
			email,
			password,
			first_name: firstName,
			last_name: lastName,
		});

		return res.status(200).json({
			status: 'success',
		});
	} catch (error) {
		return res.status(401).json({ message: 'Invalid token' });
	}
});

// @ts-ignore
router.post('/reset-password', async (req, res) => {
	const { email } = req.body;
	try {
		const response = await wooCommerceApi.get(`/customers?email=${email}`);
		// if reset password count is 1 then invalid
		if (
			response.data[0].meta_data.find(
				// @ts-ignore
				(item) => item.key === 'reset_password_count'
			)
		) {
			const value = Number(
				response.data[0].meta_data.find(
					// @ts-ignore
					(item) => item.key === 'reset_password_count'
				)?.value
			);

			if (value > 0) {
				return res.status(401).json({ message: 'Invalid' });
			}
		}
		if (response.data.length === 0) {
			return res.status(401).json({ message: 'Invalid' });
		}

		const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' });
		//update customer metq
		await wooCommerceApi.put(`/customers/${response.data[0].id}`, {
			meta_data: [
				{
					key: 'reset_password_count',
					value: 1,
				},
			],
		});
		// add a agenda job that will end in 10 minutes and delete meta_data
		//in 10 minutes i want to delete the meta_data
		setTimeout(async () => {
			await wooCommerceApi.put(`/customers/${response.data[0].id}`, {
				meta_data: [
					{
						key: 'reset_password_count',
						value: 0,
					},
				],
			});
		}, 10 * 60 * 1000);

		forgotPasswordTemplateEmail({
			name: response.data[0].first_name,
			email: email,
			url: 'https://atelieruldebaterii.ro/update-password?token=' + token,
		});
		res.status(200).json({
			message: 'Email sent',
		});
	} catch (error) {
		return res.status(401).json({ message: 'Invalid credentials' });
	}
});

// @ts-ignore
router.post('/update-password', async (req, res) => {
	const { token, password } = req.body;
	try {
		const decoded = jwt.verify(token, JWT_SECRET);
		const { email } = decoded;
		//get customer id
		const response = await wooCommerceApi.get(`/customers?email=${email}`);
		if (response.data.length === 0) {
			return res.status(401).json({ message: 'Invalid' });
		}
		const id = response.data[0].id;
		await wooCommerceApi.put(`/customers/${id}`, {
			password,
		});

		return res.status(200).json({
			status: 'success',
		});
	} catch (error) {
		return res.status(401).json({ message: 'Invalid token' });
	}
});

export default router;
