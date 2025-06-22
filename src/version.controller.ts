import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { AllowGuest } from './auth/allow-guest.decorator';
import { ConfigService } from '@nestjs/config';

@Controller('version')
export class VersionController {
    constructor(
        private readonly appService: AppService,
        private readonly configService: ConfigService,
    ) { }

    @AllowGuest()
    @Get('api')
    getApiVersion(): { version: string } {
        return this.appService.getVersion();
    }

    @AllowGuest()
    @Get('web')
    getWebVersion(): { version: string } {
        const webVersion = this.configService.get<string>('WEB_VERSION', '1.0.0');
        return { version: webVersion };
    }
} 