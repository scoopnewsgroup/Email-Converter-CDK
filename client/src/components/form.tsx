'use client';
import axios from 'axios';
import React, { useEffect, useState } from 'react';

const AWS = require('aws-sdk');

const Form = () => {
	const [campaign, setCampaign] = useState('');
	const [templates, setTemplates] = useState([
		'2023CrowdStrikeGovSummit',
		'2023ZeroTrustSummit',
		'2023Fal.Con',
		'2023ITModTalks',
	]);
	const [message, setMessage] = useState('');
	const [selectedTemplate, setSelectedTemplate] = useState('');
	const [virtual, setVirtual] = useState(false);

	const handleTemplateChange = (event) => {
		setSelectedTemplate(event.target.value);
	};

	const handleVirtualChange = () => {
		setVirtual(!virtual);
	};

	// useEffect(() => {
	// 	async function fetchData() {
	// 		// make the API call to retrieve the list of templates
	// 		const templateQty = '10';
	// 		const requestParams = `&limit=${templateQty}&orderBy=updated&sortBy=desc`;

	// 		const url = `https://api.hubapi.com/content/api/v2/templates?hapikey=demo&limit=10&orderBy=updated&sortOrder=desc`;

	// 		const response = await axios.get(url);
	// 		const data = response.data.objects;
	// 		const templateNamesArray = data.map(function (el) {
	// 			return el.name;
	// 		});

	// 		// set the state with the templates
	// 		setTemplates(data.templates);
	// 	}

	// 	fetchData();
	// }, []);

	const payload = JSON.stringify({
		campaign,
		template: virtual
			? `${selectedTemplate} - Virtual`
			: selectedTemplate,
		message,
	});

	const handleSubmit = (event) => {
		event.preventDefault();
		const lambda = new AWS.Lambda();
		const params = {
			FunctionName: 'transferEmailLambda',
			InvocationType: 'RequestResponse',
			LogType: 'Tail',
			Payload: JSON.stringify({
				campaign,
			}),
		};
		lambda.invoke(params, function (error, data) {
			if (error) {
				console.log(error);
			} else {
				console.log(data);
			}
		});
	};

	return (
		<form onSubmit={handleSubmit}>
			<h1>Email Converter</h1>
			<p style={{ maxWidth: '75%', margin: '0 auto 1rem' }}>
				This form will help you convert event emails from
				Hubspot to Constant Contact
			</p>

			<div>
				<label htmlFor='template'>
					Email Template:
					<select
						id='template'
						name='template'
						value={selectedTemplate}
						onChange={handleTemplateChange}
						required>
						{templates.map((template) => (
							<option
								key={template}
								value={template}>
								{template}
							</option>
						))}
					</select>
				</label>
				<label htmlFor='virtual'>
					Virtual
					<input
						type='checkbox'
						id='virtual'
						name='virtual'
						value='virtual'
						onChange={handleVirtualChange}
					/>
					<br />
					<br />
				</label>
				<label htmlFor='text'>
					Campaign Name:
					<input
						id='campaign'
						type='text'
						value={campaign}
						onChange={(e) =>
							setCampaign(e.target.value)
						}
						placeholder='Campaign Name (Constant Contact)'
						required
					/>
				</label>
				<label htmlFor='notes'>
					Notes:
					<textarea
						id='notes'
						value={message}
						onChange={(e) => setMessage(e.target.value)}
						placeholder='Additional Notes'
					/>
				</label>
				<button type='submit'>Submit</button>
			</div>
		</form>
	);
};

export default Form;
