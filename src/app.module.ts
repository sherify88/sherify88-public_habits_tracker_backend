import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import DatabaseModule from './database.module';
import { ScheduleModule } from '@nestjs/schedule';
import { MulterModule } from '@nestjs/platform-express';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { HabitsModule } from './habits/habits.module';
import { APP_GUARD } from '@nestjs/core';
import JwtAuthGuard from './auth/jwt-auth.guard';
import { RolesGuard } from './auth/roles.guard';
import { VersionController } from './version.controller';

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		DatabaseModule,
		ScheduleModule.forRoot(),
		MulterModule.register({
			dest: './public'
		}),
		AuthModule,
		UsersModule,
		HabitsModule,
	],
	controllers: [AppController, VersionController],
	providers: [AppService,
		{
			provide: APP_GUARD,
			useClass: JwtAuthGuard
		},
		{
			provide: APP_GUARD,
			useClass: RolesGuard
		},


		// {
		// 	provide: APP_INTERCEPTOR,
		// 	useClass: CacheInterceptor
		// },
	],
})
export class AppModule { }
