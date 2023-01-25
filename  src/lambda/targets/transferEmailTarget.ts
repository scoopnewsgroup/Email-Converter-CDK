import * as AWS from 'aws-sdk';
import axios from 'axios';

const s3 = new AWS.S3();
const HUBSPOT_API_KEY = process.env.HUBSPOT_API_KEY;
const TEMPLATE_ID = process.env.TEMPLATE_ID;
const BUCKET_NAME = process.env.BUCKET_NAME ?? 'DEFAULT_BUCKET';

export const transferTemplateLambda = async (
	event: unknown,
	context: unknown
) => {
	try {
		// Make the API call to Hubspot to get the template by ID
		const response = await axios.get(
			`https://api.hubapi.com/templates/v3/templates/${TEMPLATE_ID}?hapikey=${HUBSPOT_API_KEY}`
		);

		const template = response.data;

		// Put the template into the S3 bucket
		await s3
			.putObject({
				Bucket: BUCKET_NAME,
				Key: `email-templates/${template.name}.html`,
				Body: template.html,
				ContentType: 'text/html',
			})
			.promise();
	} catch (error) {
		console.error(error);
		throw error;
	}
};
