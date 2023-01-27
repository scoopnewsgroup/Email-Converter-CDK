import { Handler } from 'aws-lambda';
import axios from 'axios';

const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const HUBSPOT_API_KEY = process.env.HUBSPOT_API_KEY ?? 'demo';

export const transferTemplateLambda: Handler = async (event) => {
	try {
		const apiUrl =
			'`https://api.hubapi.com/templates/v2/templates/${TEMPLATE_ID}?hapikey=${HUBSPOT_API_KEY}`';

		// Make API call to Hubspot to get the most recently updated template
		const response = await axios.get(apiUrl, {
			headers: {
				Authorization: `Bearer ${HUBSPOT_API_KEY}`,
			},
			params: {
				limit: 1,
				order_by: 'updated_at',
				order_direction: 'desc',
			},
		});

		const template = response.data;

		// Create S3 putObject params
		const params = {
			Bucket: process.env.BUCKET_NAME,
			Key: `emailTemplates/${template.id}.html`,
			Body: template.html,
			ContentType: 'text/html',
		};

		// Put the template into the S3 bucket
		await s3.putObject(params).promise();

		console.log('Success, object successfully uploaded to S3');
	} catch (error) {
		console.error(error);
		throw error;
	}
};
