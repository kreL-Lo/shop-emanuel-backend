import * as SibApiV3Sdk from 'sib-api-v3-typescript';
import dotenv from 'dotenv';
import { Order } from '../types/order';
import { senders } from '../routes/newsletters/utils';
dotenv.config();

const BREVO_API_KEY = process.env.BREVO_API_KEY; // Ensure this is set in your .env file
// Configure Brevo API Client
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

const sendApiInstance = new SibApiV3Sdk.SendersApi();
const { noreply, newsletter } = senders;

const TEMPLATE_IDS = {
	register: 1,
	'forgot-password': 3,
	order: 4,
	battery: 5,
	'promoted-products': 8,
	'empty-cart': 9,
};
sendApiInstance.setApiKey(
	SibApiV3Sdk.SendersApiApiKeys.apiKey,
	// @ts-ignore
	BREVO_API_KEY
);

apiInstance.setApiKey(
	SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
	// @ts-ignore
	BREVO_API_KEY
);
//get template data

export const registerTemplateEmail = async ({
	email,
	name,
	url,
}: {
	email: string;
	name: string;
	url: string;
}) => {
	try {
		const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
		// make sure that from is valid
		sendSmtpEmail.to = [{ email, name }];
		sendSmtpEmail.templateId = TEMPLATE_IDS.register;
		sendSmtpEmail.params = {
			name: name,
			url: url,
		};
		sendSmtpEmail.sender = {
			name: noreply.name,
			email: noreply.email,
		};
		apiInstance.sendTransacEmail(sendSmtpEmail);

		return {};
	} catch (error) {
		console.error('Error sending email:', error);
	}
};

export const forgotPasswordTemplateEmail = async ({
	email,
	name,
	url,
}: {
	email: string;
	name: string;
	url: string;
}) => {
	try {
		const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
		// make sure that from is valid

		sendSmtpEmail.to = [{ email, name }];
		sendSmtpEmail.templateId = TEMPLATE_IDS['forgot-password'];
		sendSmtpEmail.params = {
			name: name,
			url: url,
			contact: process.env.COMPANY_EMAIL,
		};

		sendSmtpEmail.sender = {
			name: noreply.name,
			email: noreply.email,
		};
		apiInstance.sendTransacEmail(sendSmtpEmail);

		return {};
	} catch (error) {
		console.error('Error sending email:', error);
	}
};

const getEmailTemplate = async (templateId: number) => {
	return await apiInstance.getSmtpTemplate(templateId);
};

const overrideStringedData = (
	rawString: string,
	key: string,
	value: string
) => {
	const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
	const newString = rawString.replace(regex, value);
	return newString;
};

const overrideOverExistingParams = (params: any, rawString: string) => {
	const keys = Object.keys(params);
	keys.forEach((key) => {
		const buildKey = 'params.' + key;
		rawString = overrideStringedData(rawString, buildKey, params[key]);
	});
	return rawString;
};

export const orderTemplateEmail = async ({
	name,
	order_number,
	order_date,
	order_total,
	order_items,
	shipping_address,
	url,
	email,
}: {
	name: string;
	order_number: string;
	order_date: string;
	order_total: string;
	order_items: string;
	shipping_address: string;
	url: string;
	email: string;
}) => {
	try {
		const params = {
			name: name,
			order_number: order_number,
			order_date: order_date,
			order_total: order_total,
			order_items: order_items,
			shipping_address: shipping_address,
			url: url,
			contact: process.env.COMPANY_EMAIL,
		};
		const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
		// make sure that from is valid
		sendSmtpEmail.to = [{ email, name }];
		const template = await getEmailTemplate(TEMPLATE_IDS['order']);
		const tBody = template.body;
		const buildSubject = overrideOverExistingParams(params, tBody.subject);
		sendSmtpEmail.subject = buildSubject;
		sendSmtpEmail.htmlContent = overrideOverExistingParams(
			params,
			tBody.htmlContent
		);
		sendSmtpEmail.sender = {
			// @ts-ignore
			name: senders.noreply.name,
			email: senders.noreply.email,
		};

		//get a sender
		apiInstance.sendTransacEmail(sendSmtpEmail);

		return {};
	} catch (error) {
		console.error('Error sending email:', error);
	}
};

export const createBatteryEmailTemplate = async ({
	name,
	email,
	url,
}: {
	name: string;
	email: string;
	url: string;
}) => {
	try {
		const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
		// make sure that from is valid
		const TEMPLATE_ID = 5;
		sendSmtpEmail.to = [{ email, name }];
		sendSmtpEmail.templateId = TEMPLATE_ID;
		sendSmtpEmail.params = {
			name: name,
			url: url,
			contact: process.env.COMPANY_EMAIL,
		};

		sendSmtpEmail.sender = {
			name: senders.newsletter.name,
			email: senders.newsletter.email,
		};
		apiInstance.sendTransacEmail(sendSmtpEmail);

		return {};
	} catch (error) {
		console.error('Error sending email:', error);
	}
};

const buildHtmlForProduct = (item: {
	id: string;
	name: string;
	price: string;
	quantity: string;
	image: string;
}) => {
	return `<div style="display: flex; align-items: center; margin-bottom: 10px; overflow: hidden; margin-top: 10px">
	<img src="${item.image}" alt="${item.name}" style="width: 100px; height: 100px; object-fit: cover; margin-right: 10px; border-radius: 8px;" />
	<div style="flex: 1;">
		<h2 style="font-size: 16px; margin: 0;">${item.name}</h2>
		<p style="margin: 5px 0;">Pret: <strong>${item.price} RON</strong></p>
		<p style="margin: 5px 0;">Cantitate: <strong>${item.quantity}</strong></p>
	</div>
</div>`;
};

const buildHtmlForProductWithButton = (item: {
	id: string;
	name: string;
	price: string;
	image: string;
	url?: string;
}) => {
	return `<div style="display: flex; align-items: center; margin-bottom: 10px; overflow: hidden; margin-top: 10px">
	<img src="${item.image}" alt="${item.name}" style="width: 100px; height: 100px; object-fit: cover; margin-right: 10px; border-radius: 8px;" />
	<div style="flex: 1;">
		<h2 style="font-size: 16px; margin: 0;">${item.name}</h2>
		<p style="margin: 5px 0;">Pret: <strong>${item.price} RON</strong></p>
		<a href="${item.url}" style="display: inline-block; margin-top: 10px; padding: 10px 15px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px; font-size: 14px;">Vezi Produsul</a>
	</div>
</div>`;
};
export const imgSrc = (src: string) => {
	// if src contains localhost:8083/wordpress then replace with cms.atelieruldebaterii.ro
	if (src === '') {
		return 'https://atelieruldebaterii.ro/battery.jpg';
	}
	if (!src) return '';
	const replaced = src.replace(
		/http:\/\/localhost:8013\/wordpress/g,
		'https://cms.atelieruldebaterii.ro'
	);

	return replaced;
};

export const buildHtmlForProducts = (
	items: {
		id: string;
		name: string;
		price: string;
		quantity: string;
		image: string;
		url?: string;
	}[],
	type = 'product'
) => {
	let html: string[] = [];
	if (type === 'product') {
		html = items.map((item) => {
			return buildHtmlForProduct(item);
		});
	}
	if (type === 'product-button') {
		html = items.map((item) => {
			return buildHtmlForProductWithButton(item);
		});
	}
	return html.join('');
};

export const buildAddressLine = (addres: Order['billing']) => {
	const addressParts = [
		addres?.first_name,
		addres?.last_name,
		addres?.address_1,
		addres?.city,
		addres?.state,
		addres?.postcode,
		addres?.country,
	].filter((part) => part && part.trim() !== '');
	const addressLine =
		addressParts.length > 0 ? addressParts.join(', ') : 'Address not available';
	return addressLine;
};

export const promotedProductsEmail = async ({
	name,
	products,
	email,
}: {
	name: string;
	products: string;
	email: string;
}) => {
	try {
		const params = {
			name: name,
			products: products,
			contact: process.env.COMPANY_EMAIL,
		};
		const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
		// make sure that from is valid
		sendSmtpEmail.to = [{ email, name }];
		const template = await getEmailTemplate(TEMPLATE_IDS['promoted-products']);
		const tBody = template.body;
		const buildSubject = overrideOverExistingParams(params, tBody.subject);
		sendSmtpEmail.subject = buildSubject;
		sendSmtpEmail.htmlContent = overrideOverExistingParams(
			params,
			tBody.htmlContent
		);
		sendSmtpEmail.sender = {
			// @ts-ignore
			name: senders.newsletter.name,
			email: senders.newsletter.email,
		};

		console.log('here', sendSmtpEmail);
		//get a sender
		apiInstance.sendTransacEmail(sendSmtpEmail);

		return {};
	} catch (error) {
		console.error('Error sending email:', error);
	}
};

export const emptyCartEmailTemplate = async ({
	name,
	email,
	url,
}: {
	name: string;
	email: string;
	url: string;
}) => {
	try {
		const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
		// make sure that from is valid
		const TEMPLATE_ID = TEMPLATE_IDS['empty-cart'];
		sendSmtpEmail.to = [{ email, name }];
		sendSmtpEmail.templateId = TEMPLATE_ID;
		sendSmtpEmail.params = {
			name: name,
			url: url,
			contact: process.env.COMPANY_EMAIL,
		};

		sendSmtpEmail.sender = {
			name: senders.newsletter.name,
			email: senders.newsletter.email,
		};
		apiInstance.sendTransacEmail(sendSmtpEmail);

		return {};
	} catch (error) {
		console.error('Error sending email:', error);
	}
};
