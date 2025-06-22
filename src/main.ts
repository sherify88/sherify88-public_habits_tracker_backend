import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { APIGatewayProxyEvent, Context, APIGatewayProxyResult } from 'aws-lambda';
import * as awsServerlessExpress from 'aws-serverless-express';
import { Server } from 'http';
import * as AWSXRay from 'aws-xray-sdk-core';
import * as xrayExpress from 'aws-xray-sdk-express';

AWSXRay.captureHTTPsGlobal(require('http'));
AWSXRay.captureHTTPsGlobal(require('https'));

let cachedServer: Server;

async function bootstrap(): Promise<Server> {
	if (cachedServer) {
		return cachedServer;
	}

	const app = await NestFactory.create<NestExpressApplication>(AppModule);

	app.use(xrayExpress.openSegment('HabitsTrackerBackend'));

	const isLambda = !!process.env.AWS_LAMBDA_FUNCTION_NAME;

	app.useGlobalPipes(new ValidationPipe({
		whitelist: true,
		transform: true,
		forbidNonWhitelisted: true,
		stopAtFirstError: true
	}));
	app.enableCors();
	if (isLambda) {
		await app.init();
		app.use(xrayExpress.closeSegment());

		const expressApp = app.getHttpAdapter().getInstance();
		cachedServer = awsServerlessExpress.createServer(expressApp);
		return cachedServer;
	} else {
		const config = new DocumentBuilder()
			.setTitle('Habits Tracker API')
			.setDescription('API for tracking habits')
			.setVersion('1.0')
			.addBearerAuth()
			.build();
		const document = SwaggerModule.createDocument(app, config);
		SwaggerModule.setup('docs', app, document);

		const configService = app.get(ConfigService);
		const port = configService.get('PORT') || 3000;
		await app.listen(port);
		console.log(`Application is running on http://localhost:${port}`);
		return null;
	}
}

export const handler = async (
	event: APIGatewayProxyEvent,
	context: Context,
): Promise<APIGatewayProxyResult> => {
	if (!cachedServer) {
		await bootstrap();
	}

	return await awsServerlessExpress.proxy(cachedServer, event, context, 'PROMISE').promise as unknown as Promise<APIGatewayProxyResult>;
};

// Start server for local development
if (!process.env.AWS_LAMBDA_FUNCTION_NAME) {
	bootstrap();
}
