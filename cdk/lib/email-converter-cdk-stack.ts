import {
	aws_lambda_event_sources,
	CfnOutput,
	Stack,
	StackProps,
} from 'aws-cdk-lib';
import { EventBus, Rule, Schedule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import { Code, Runtime } from 'aws-cdk-lib/aws-lambda';
import {
	NodejsFunction,
	NodejsFunctionProps,
} from 'aws-cdk-lib/aws-lambda-nodejs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export class EmailConverterCdkStack extends Stack {
	constructor(scope: Construct, id: string, props?: StackProps) {
		super(scope, id, props);

		const eventBusName = 'EmailControlEventBus';
		const bucketName = process.env.BUCKET_NAME ?? '';

		const environmentParams = {
			environment: {
				eventBusName,
				bucketName,
			},
		};

		// creating the emailBucket in S3
		const emailBucket = new s3.Bucket(this, 'EmailBucket', {
			bucketName,
		});

		// Adding S3 Bucket Name to environment parameters and re-setting the environment variable to confirm it matches up to correct bucket
		environmentParams.environment.bucketName = emailBucket.bucketName;
		process.env.BUCKET_NAME = emailBucket.bucketName;

		// L A M B D A   F U N C T I O N S

		// TRANSFER LAMBDA FUNCTION
		// Pull the email template from Hubspot and transfer it over to the corresponding S3 bucket, which will then trigger the second lambda function to run
		const transferEmailLambda = new NodejsFunction(
			this,
			'TransferEmailHandler',
			{
				handler: 'src/lambda/targets/transferEmailTarget.ts',
				...nodeJsFunctionProps,
				...environmentParams,
			}
		);

		// add a CloudWatch event that triggers the Lambda function on a schedule
		const rule = new Rule(this, 'EmailTransferRule', {
			schedule: Schedule.cron({
				minute: '0',
				hour: '1',
			}),
		});
		rule.addTarget(new LambdaFunction(transferEmailLambda));

		// CONVERSION LAMBDA FUNCTION
		// Converting the email from the S3 bucket and post requesting it to the Constant Contact API
		const convertEmailLambda = new NodejsFunction(
			this,
			'ConvertEmailHandler',
			{
				handler: 'src/lambda/targets/convertEmailTarget.ts',
				...nodeJsFunctionProps,
				...environmentParams,
				events: [
					new aws_lambda_event_sources.S3EventSource(
						emailBucket,
						{
							events: [s3.EventType.OBJECT_CREATED],
						}
					),
				],
			}
		);

		// E V E N T B U S
		const eventBus = new EventBus(this, 'eventBus', {
			eventBusName: eventBusName,
		});

		// G R A N T   P E R M I S S I O N S
		eventBus.grantPutEventsTo(transferEmailLambda);
		eventBus.grantPutEventsTo(convertEmailLambda);

		// O U T P U T S
		new CfnOutput(this, 'eventBusArn', {
			value: eventBus.eventBusArn,
		});
	}
}

const nodeJsFunctionProps: NodejsFunctionProps = {
	runtime: Runtime.NODEJS_14_X,
	bundling: {
		externalModules: [
			'aws-sdk', // Use the 'aws-sdk' available in the Lambda runtime
		],
	},
};
