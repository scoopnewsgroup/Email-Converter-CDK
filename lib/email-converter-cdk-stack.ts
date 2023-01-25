import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class EmailConverterCdkStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		// L A M B D A   F U N C T I O N S

		// Pull the email template from Hubspot and transfer it over to the corresponding S3 bucket, which will then trigger the second lambda function to run
		const transferEmailLambda = new cdk.aws_lambda.Function(
			this,
			'TransferEmailHandler',
			{
				runtime: cdk.aws_lambda.Runtime.NODEJS_14_X,
				code: cdk.aws_lambda.Code.fromAsset('lambda'),
				handler: 'src/lambda/targets/transferEmailTarget.ts',
			}
		);

		// Converting the email from the S3 bucket and post requesting it to the Constant Contact API
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

		const emailConversionEventSource =
			new cdk.aws_lambda_event_sources.S3EventSource(
				emailConversionBucket,
				{
					events: [cdk.aws_s3.EventType.OBJECT_CREATED],
				}
			);

		convertEmailLambda.addEventSource(emailConversionEventSource);
	}
}
