
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';

config();

const configService = new ConfigService();
export const dataSource: DataSource = new DataSource({
  migrations: ['migrations/*.js'],
  //  cli: {
  //    migrationsDir: 'migrations'
  //  },
  type: 'postgres',
  host: configService.get('DB_HOST'),
  port: configService.get('DB_PORT'),
  username: configService.get('DB_USER'),
  password: configService.get('DB_PWD'),
  database: configService.get('DB_NAME'),
  entities: ['dist/src/**/*.entity.js'],
  synchronize: false
});

//  const legacyDataSource: DataSource= new DataSource({
//   migrations: [  'migrations/*.js' ],
// //  cli: {
// //    migrationsDir: 'migrations'
// //  },
//   type:'mysql',
//   host: configService.get('LEGACY_DB_HOST'),
//   port: configService.get('LEGACY_DB_PORT'),
//   username: configService.get('LEGACY_DB_USER'),
//   password: configService.get('LEGACY_DB_PWD'),
//   database: configService.get('LEGACY_DB_NAME'),
//   entities: ['dist/src/**/*.entity.js'],
//   synchronize:false
// });

export const legacyDataSource: DataSource = new DataSource({
  type: 'mysql',
  host: configService.get('LEGACY_DB_HOST'),
  port: configService.get('LEGACY_DB_PORT'),
  username: configService.get('LEGACY_DB_USER'),
  password: configService.get('LEGACY_DB_PWD'),
  database: configService.get('LEGACY_DB_NAME'),
  entities: [],
  migrationsRun: false,
  synchronize: false,
  // Other options...
});
