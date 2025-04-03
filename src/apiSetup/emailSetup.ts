import * as SibApiV3Sdk from 'sib-api-v3-typescript';
import dotenv from 'dotenv';
dotenv.config();

const BREVO_API_KEY = process.env.BREVO_API_KEY; // Ensure this is set in your .env file
// Configure Brevo API Client
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
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
		throw new Error('Failed to send email');
	}
};

export const forgotPasswordTemplateEmail = async ({
	email,
	name,
	url,
	contact,
}: {
	email: string;
	name: string;
	url: string;
	contact: string;
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
			contact: contact,
		};

		apiInstance.sendTransacEmail(sendSmtpEmail);

		return {};
	} catch (error) {
		console.error('Error sending email:', error);
		throw new Error('Failed to send email');
	}
};
