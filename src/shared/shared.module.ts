import { Global, Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeormUtil } from 'src/utils/typeorm.util';
import { Meta } from './entities/meta.entity';
import { AllExceptionsFilter } from './exception-filters/all-exceptions.filter';
import { SharedService } from './shared.service';
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Meta]), ConfigModule],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    SharedService,
    TypeormUtil,
  ],
  exports: [SharedService, TypeormUtil],
})
export class SharedModule {}
