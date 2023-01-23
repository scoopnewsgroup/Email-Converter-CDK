import * as cdk from 'aws-cdk-lib';
// import { S3EventSource } from 'aws-cdk/bin/c';
import { Construct } from 'constructs';
// import {
// 	NodejsFunction,
// 	NodejsFunctionProps,
// } from 'aws-cdk-lib/aws-lambda-nodejs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class EmailConverterCdkStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		// Lambda Functions
		// Here is another implementation that I've seen
		const convertEmailLambda = new cdk.aws_lambda.Function(
			this,
			'ConvertEmailHandler',
			{
				runtime: cdk.aws_lambda.Runtime.NODEJS_14_X,
				code: cdk.aws_lambda.Code.fromAsset('lambda'),
				handler: 'src/lambda/targets/convertEmailTarget.ts',
			}
		);

		// Create New s3 bucket that will run when
		const emailConversionBucket = new cdk.aws_s3.Bucket(
			this,
			'MyEmailConversionBucket'
		);
		emailConversionBucket.addEventNotification(
			cdk.aws_s3.EventType.OBJECT_CREATED,
			new cdk.aws_lambda_event_sources.S3EventSource(
				emailConversionBucket,
				{
					events: [cdk.aws_s3.EventType.OBJECT_CREATED],
				}
			).bind(convertEmailLambda)
		);

		// Here was an initial idea I had for implemnetation from what I've seen on our internal stack...
		// const convertEmail = new NodejsFunction(
		// 	this,
		// 	'convertEmailFunction',
		// 	{
		// 		entry: 'src/lambda/targets/convertEmailTarget.ts',
		// 		...NodejsFunctionProps,
		// 		environment: {
		// 			...NodejsFunctionProps.environment,
		// 		},
		// 	}
		// );

		// The code that defines your stack goes here

		// example resource
		// const queue = new sqs.Queue(this, 'EmailConverterCdkQueue', {
		//   visibilityTimeout: cdk.Duration.seconds(300)
		// });
	}
}
