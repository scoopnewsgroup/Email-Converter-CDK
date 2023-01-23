// import { S3 } from 'aws-sdk';
import * as S3 from 'aws-sdk/clients/s3';
import axios from 'axios';

const s3 = new S3();

export const handler = async (event: any) => {
	const apiKey = process.env.CONSTANT_CONTACT_API_KEY;
	try {
		// Get the S3 bucket and key from the event
		const bucket = event.Records[0].s3.bucket.name;
		const key = event.Records[0].s3.object.key;

		// Get the template.html file from the S3 bucket
		const result = await s3
			.getObject({ Bucket: bucket, Key: key })
			.promise();
		// let html = '../../../test.html';
		let html = result.Body.toString();

		// Remove the "read in browser" link and email preferences/unsubscribe links from the file
		// html = html.replace(/<a href.*?<\/a>/g, '');
		html = html.replace(/<div class="cols2".*?<\/div>/g, ''); // I think this should remove all the parts of the email not wanted for Constant Contact

		// Create the email campaign in Constant Contact
		const campaign = {
			name: '01/23/2022 FedScoop Newsletter',
			subject: '01/23/2022 FedScoop Newsletter',
			from_email: 'tech@scoopnewsgroup.com',
			reply_to_email: 'tech@scoopnewsgroup.com',
			html_content: html,
			physical_address_in_footer: {
				address_line1: '2001 K St Later #1411',
				city: 'Washington, DC',
				country_code: 'US',
				postal_code: '20006',
				state_code: 'DC',
			},
		};
		const response = await axios.post(
			'https://api.constantcontact.com/v3/email_marketing/campaigns',
			campaign,
			{
				headers: {
					Authorization: `Bearer ${apiKey}`,
					'Content-Type': 'application/json',
				},
			}
		);
		console.log(response.data);
	} catch (err) {
		console.log(err);
		throw err;
	}
};
