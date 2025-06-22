import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { AllowGuest } from './auth/allow-guest.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @AllowGuest()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
