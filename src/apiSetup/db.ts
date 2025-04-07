const mysql = require('mysql2/promise');

import dotenv from 'dotenv';

//@ts-check
dotenv.config();
const db = mysql.createPool({
	host: process.env.DB_HOST || 'localhost',
	user: process.env.DB_USER || 'admin',
	password: process.env.DB_PASSWORD || 'test123',
	database: process.env.DB_NAME || 'wordpress',
});

export default db;
