const express = require('express');
const Knex = require('knex');
const { Model } = require('objection');

// Set up the Express app
const app = express();
const port = 3000;

// Configure Knex for MySQL
const knex = Knex({
	client: 'mysql2',
	connection: {
		host: 'localhost',
		user: 'root',
		password: 'test123#',
		database: 'wordpress',
		port: 3306,
		ssl: false, // Disable SSL if not needed
	},
});

// Bind Knex to Objection
export default knex;
