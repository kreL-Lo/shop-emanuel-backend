import * as SibApiV3Sdk from 'sib-api-v3-typescript';
import dotenv from 'dotenv';
import express from 'express';

dotenv.config();

const BREVO_API_KEY = process.env.BREVO_API_KEY || ''; // Ensure this is set in your .env file

const sendApiInstance = new SibApiV3Sdk.SendersApi();

sendApiInstance.setApiKey(
	SibApiV3Sdk.SendersApiApiKeys.apiKey,
	// @ts-ignore
	BREVO_API_KEY
);

export const brevoSenders = async () => {
	const senders = await sendApiInstance.getSenders();
	const body = senders.body.senders;
	const object = {
		newsletter:
			body?.find((item: { name: string }) => item.name === 'newsletter') ||
			null,
		noreply:
			body?.find((item: { name: string }) => item.name === 'noreply') || null,
	};

	console.log('brevoSenders', object);
	return object;
};

export const senders = {
	newsletter: {
		id: 3,
		name: 'newsletter',
		email: 'newsletter@atelieruldebaterii.ro',
		active: true,
		ips: [],
	},
	noreply: {
		id: 2,
		name: 'noreply',
		email: 'noreply@atelieruldebaterii.ro',
		active: true,
		ips: [],
	},
};
