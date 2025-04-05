import * as SibApiV3Sdk from 'sib-api-v3-typescript';
import dotenv from 'dotenv';
import { htmlToString } from './test';
import { Order } from '../types/order';
dotenv.config();

const BREVO_API_KEY = process.env.BREVO_API_KEY; // Ensure this is set in your .env file
// Configure Brevo API Client
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

const sendApiInstance = new SibApiV3Sdk.SendersApi();

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
		const TEMPLATE_ID = 1;
		sendSmtpEmail.to = [{ email, name }];
		sendSmtpEmail.templateId = TEMPLATE_ID;
		sendSmtpEmail.params = {
			name: name,
			url: url,
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
		const TEMPLATE_ID = 3;
		sendSmtpEmail.to = [{ email, name }];
		sendSmtpEmail.templateId = TEMPLATE_ID;
		sendSmtpEmail.params = {
			name: name,
			url: url,
			contact: process.env.COMPANY_EMAIL,
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
		const TEMPLATE_ID = 4;
		sendSmtpEmail.to = [{ email, name }];
		const senders = await sendApiInstance.getSenders();
		const template = await getEmailTemplate(TEMPLATE_ID);
		const tBody = template.body;
		const buildSubject = overrideOverExistingParams(params, tBody.subject);
		sendSmtpEmail.subject = buildSubject;
		sendSmtpEmail.htmlContent = overrideOverExistingParams(
			params,
			tBody.htmlContent
		);
		sendSmtpEmail.sender = {
			// @ts-ignore
			name: 'Atelierul de baterii',
			email: 'emanuelbuzatu1@gmail.com',
		};

		//get a sender
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
	}[]
) => {
	const html = items.map((item) => {
		return buildHtmlForProduct(item);
	});
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

const testOrderTemplate = async () => {
	const payload = {
		order_number: '366',
		url: 'test',
		order_date: '4/4/2025',
		order_total: 'test 100 ron',
		order_items: buildHtmlForProducts([
			{
				id: '1',
				name: 'test1',
				price: '100',
				quantity: '2',
				image: 'https://picsum.photos/300/300',
			},
			{
				id: '2',
				name: 'test2',
				price: '200',
				quantity: '3',
				image: 'https://picsum.photos/300/300',
			},
		]),
		shipping_address: buildAddressLine({
			first_name: 'John',
			last_name: 'Doe',
			address_1: '123 Main St',
			city: 'New York',
			state: 'NY',
			postcode: '10001',
			country: 'USA',
		}),
		email: 'ciprian.miru@gmail.com',
		name: 'ciprian miru',
	};
	orderTemplateEmail(payload);

	//get template data
};

setTimeout(() => {
	// testOrderTemplate();
}, 1000);
