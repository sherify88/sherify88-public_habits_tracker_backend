import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

export let isDev = process.env.NODE_ENV === 'dev';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        // Only use PostgreSQL if explicitly configured
        const useDatabase = configService.get('USE_DATABASE', 'false') === 'true';

        if (!useDatabase) {
          // Return a minimal config that won't actually connect
          return {
            type: 'sqlite',
            database: ':memory:',
            entities: [],
            synchronize: false,
            logging: false,
          };
        }

        return {
          type: 'postgres',
          host: configService.get('DB_HOST'),
          port: configService.get('DB_PORT'),
          username: configService.get('DB_USER'),
          password: configService.get('DB_PWD'),
          database: configService.get('DB_NAME'),
          entities: ['dist/src/**/entities/*.entity.js'],
          autoLoadEntities: true,
          synchronize: isDev,
        };
      },
    }),
  ],
})
class DatabaseModule { }

export default DatabaseModule;