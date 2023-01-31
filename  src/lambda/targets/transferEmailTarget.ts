import { Handler } from 'aws-lambda';
import axios from 'axios';

const AWS = require('aws-sdk');
const s3 = new AWS.S3();

const HUBSPOT_API_KEY = process.env.HUBSPOT_API_KEY ?? 'demo';
const BUCKET_NAME = process.env.HUBSPOT_API_KEY ?? 'defaultBucket';
const emailName = 'Blog'; // Does not have to be the exact name as the template, for example 2023DefenseTalks should get both the virtual and non virtual tempaltes for example and post them both up to the S3 bucket

export const transferTemplateLambda: Handler = async (event) => {
	try {
		const apiUrl = `https://api.hubapi.com/content/api/v2/templates?hapikey=${HUBSPOT_API_KEY}`;

		// Make API call to Hubspot to get the most recently updated template
		const response = await axios.get(apiUrl);
		const data = response.data.objects;

		const templates = data.filter((template) =>
			template.filename.includes(emailName)
		);

		{
			templates.map(async (template) => {
				await s3
					.putObject({
						Bucket: BUCKET_NAME,
						Key: `email-templates/${template.filename}${
							template.filename.includes('.html')
								? ''
								: '.html'
						}`,
						Body: template.source,
						ContentType: 'text/html',
					})
					.promise();
			});
		}

		console.log('Success, object successfully uploaded to S3');
	} catch (error) {
		console.error(error);
		throw error;
	}
};
