const express = require('express');
const axios = require('axios');
const router = express.Router();
require('dotenv').config();

const WOO_BASE_URL = process.env.WOO_BASE_URL;

const WP_URL = `${WOO_BASE_URL}/wp-json/jwt-auth/v1/token`;

//@ts-ignore
router.post('/login', async (req, res) => {
	const { username, password } = req.body;
	console.log('username', username);
	console.log('password', password);
	try {
		const response = await axios.post(WP_URL, {
			username,
			password,
		});

		return res.json(response.data); // Returns JWT Token
	} catch (error) {
		// console.log('Error:', error);
		return res.status(401).json({ message: 'Invalid credentials' });
	}
});

export default router;
