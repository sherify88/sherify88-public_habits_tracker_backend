import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { urlencoded, json } from 'express';

import { DocumentBuilder, SwaggerDocumentOptions, SwaggerModule, SwaggerCustomOptions } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';


const configService = new ConfigService();
export let nestApp: NestExpressApplication;
async function bootstrap() {
	nestApp = await NestFactory.create<NestExpressApplication>(AppModule);

	nestApp.useStaticAssets(join(__dirname, '..', '../public'), {
		prefix: '/public/',
	});
	nestApp.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			//	forbidNonWhitelisted: true,
			transform: true,
			//	disableErrorMessages: [ 'prod', 'production' ].includes(process.env['NODE_ENV'])
		})
	);



	setupSwagger();


	const requestBodyLimit = process.env['PAYLOAD_SIZE_LIMIT'];
	nestApp.use(json({ limit: requestBodyLimit }));
	nestApp.use(urlencoded({ extended: true, limit: requestBodyLimit }));

	//app.enableCors({allowedHeaders:['X-Requested-With', 'X-HTTP-Method-Override', 'Authorization', 'Content-Type', 'Accept', 'Observe'],origin:'*',methods:['GET','PUT','PATCH','POST','DELETE'],});
	nestApp.enableCors();
	// app.use(function(req, res, next) {
	// 	res.header("Access-Control-Allow-Origin", "*");
	// 	res.header("Access-Control-Allow-Methods", "GET,PUT,PATCH,POST,DELETE");
	// 	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Authorization, Accept");
	// 	next();
	//   });
	const port = process.env.port || configService.get('PORT');
	await nestApp.listen(port);

	function setupSwagger() {
		const config = new DocumentBuilder()
			.setTitle('Habits Tracker')
			.setDescription('Habits Tracker REST API specification')
			.setVersion('1.0')
			.addBasicAuth()
			.addBearerAuth()
			.build();

		const options: SwaggerDocumentOptions = {
			operationIdFactory: (controllerKey: string, methodKey: string) => methodKey
		};

		const document = SwaggerModule.createDocument(nestApp, config, options);

		const customOptions: SwaggerCustomOptions = {
			swaggerOptions: {
				persistAuthorization: true,
				defaultModelsExpandDepth: -1,
				defaultModelExpandDepth: -1,
				syntaxHighlight: { activated: false, theme: 'agate' },
				filter: true,
				docExpansion: 'none'
			},
			customSiteTitle: 'Habits Tracker API Docs'
		};

		SwaggerModule.setup('docs', nestApp, document, customOptions);
	}



}
bootstrap();
