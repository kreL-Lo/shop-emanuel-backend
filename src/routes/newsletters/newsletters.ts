import * as SibApiV3Sdk from 'sib-api-v3-typescript';
import dotenv from 'dotenv';
import express from 'express';
import {
	buildHtmlForProducts,
	createBatteryEmailTemplate,
	emptyCartEmailTemplate,
	imgSrc,
	promotedProductsEmail,
} from '../../apiSetup/emailSetup';
import {
	queryForPromotedProducts,
	queryUsersMetadata,
} from '../prodRoutes/prodUtils';
import wooCommerceApi from '../../apiSetup/wooCommerceApi';
import { Product } from '../../types/product';
import dayjs from 'dayjs';

const cron = require('node-cron');

// set up a crone job every friday at 10:00

const triggerCreateBatteryEmail = () => {
	getAllContacts().then((contacts) => {
		contacts.forEach((r: { email: string; name: string }) => {
			const object = {
				name: r.name,
				email: r.email,
				url: 'https://armondone.com/design-battery',
			};
			try {
				createBatteryEmailTemplate(object);
			} catch (error) {
				console.log('error', error);
			}
		});
	});
};

const triggerPromotedProductsEmail = async () => {
	const prodIds = await queryForPromotedProducts();
	const actualProducts = await wooCommerceApi.get('products', {
		include: prodIds.map((item) => item.id).join(','),
	});
	const prods = actualProducts.data.map((item: Product) => ({
		id: item.id,
		name: item.name,
		price: item.price,

		// imgSrc(item.image.src)
		image: imgSrc(item.images[0].src) || '',
		url: `https://armondone.com/products/${item.slug}`,
	}));

	const html = buildHtmlForProducts(prods, 'product-button');

	getAllContacts().then((contacts) => {
		contacts.forEach((r: { email: string; name: string }) => {
			const object = {
				name: r.name,
				email: r.email,
				products: html,
			};
			try {
				promotedProductsEmail(object);
			} catch (error) {
				console.log('error', error);
			}
		});
	});
};
//TODO: a small test for cron job
//	schedule every friday at 10:00
cron.schedule('0 10 * * 5', () => {
	// cron.schedule('*/10 * * * * *', () => {
	console.log('running a triggerCreateBatteryEmail every Friday at 10:00');
	triggerCreateBatteryEmail();
});

//  schedule every wednesday at 10:00
cron.schedule('0 10 * * 3', () => {
	// cron.schedule('*/10 * * * * *', () => {
	console.log(
		'running a triggerPromotedProductsEmail every Wednesday at 10:00'
	);
	triggerPromotedProductsEmail();
});

const router = express.Router();
dotenv.config();

const BREVO_API_KEY = process.env.BREVO_API_KEY || ''; // Ensure this is set in your .env file

const sendApiInstance = new SibApiV3Sdk.SendersApi();

sendApiInstance.setApiKey(
	SibApiV3Sdk.SendersApiApiKeys.apiKey,
	// @ts-ignore
	BREVO_API_KEY
);
const contactsApiInstance = new SibApiV3Sdk.ContactsApi();
contactsApiInstance.setApiKey(
	SibApiV3Sdk.ContactsApiApiKeys.apiKey,
	BREVO_API_KEY
);

const triggerEmptyCartEmail = async () => {
	queryUsersMetadata().then((res) => {
		const list = res;

		list.forEach((r: { email: string; name: string }) => {
			console.log('r', r);
			const object = {
				name: r.name,
				email: r.email,
				url: `https://armondone.com/login?email=${r.email}redirect=cart`,
			};
			try {
				emptyCartEmailTemplate(object);
			} catch (error) {
				console.log('error', error);
			}
		});
	});
};

// cron.schedule('0 * * * *', () => {
// 	// cron.schedule('*/10 * * * * *', () => {
// 	const currentHour = dayjs().format('HH');
// 	console.log(`running a triggerEmptyCartEmail every hour ${currentHour}`);
// 	triggerEmptyCartEmail();
// });
// Configure Brevo API Client

const getAllContacts = async () => {
	const contacts = await contactsApiInstance.getContacts();

	const mapContancts = contacts.body.contacts
		.filter((contact: { email?: string }) => contact.email !== undefined)
		.map((contact: { email: string; attributes?: { FIRSTNAME?: string } }) => {
			return {
				email: contact.email,
				name: contact.attributes?.FIRSTNAME || 'User',
			};
		});

	return mapContancts;
};

// Subscribe endpoint
// @ts-ignore
export const subscribeUser = async (
	email: string,
	firstName: string = 'User',
	lastName: string = ''
): Promise<{ success: boolean; message: string; data?: any }> => {
	if (!email) {
		throw new Error('Email is required');
	}

	const createContact = new SibApiV3Sdk.CreateContact();
	createContact.email = email;
	createContact.attributes = { FIRSTNAME: firstName, LASTNAME: lastName };
	createContact.listIds = [2]; // Replace with your Brevo list ID

	try {
		const response = await contactsApiInstance.createContact(createContact);
		return {
			success: true,
			message: 'Successfully subscribed',
			data: response,
		};
	} catch (error: any) {
		if (
			error.response &&
			error.response.body &&
			error.response.body.code === 'duplicate_parameter'
		) {
			// Update the contact's first name and last name
			try {
				const updateContact = new SibApiV3Sdk.UpdateContact();
				updateContact.attributes = { FIRSTNAME: firstName, LASTNAME: lastName };

				const updateResponse = await contactsApiInstance.updateContact(
					email,
					updateContact
				);

				return {
					success: true,
					message: 'Contact already subscribed. Updated details successfully.',
					data: updateResponse,
				};
			} catch (updateError: any) {
				throw new Error(
					`Failed to update contact details: ${updateError.message}`
				);
			}
		}
		throw new Error(`Failed to subscribe: ${error.message}`);
	}
};

// add subscribe route
router.post('/subscribe', async (req, res) => {
	const { email, firstName, lastName } = req.body;

	try {
		const result = await subscribeUser(email, firstName, lastName);
		res.status(200).json(result);
	} catch (error: any) {
		res.status(400).json({ success: false, message: error.message });
	}
});
export default router;
