import { Test, TestingModule } from '@nestjs/testing';
import { VersionController } from './version.controller';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';

describe('VersionController', () => {
  let versionController: VersionController;
  let appService: AppService;
  let configService: ConfigService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [VersionController],
      providers: [
        AppService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('1.0.0'),
          },
        },
      ],
    }).compile();

    versionController = app.get<VersionController>(VersionController);
    appService = app.get<AppService>(AppService);
    configService = app.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(versionController).toBeDefined();
  });

  describe('getApiVersion', () => {
    it('should return the API version', () => {
      const mockVersion = { version: '1.0.0' };
      jest.spyOn(appService, 'getVersion').mockReturnValue(mockVersion);

      expect(versionController.getApiVersion()).toEqual(mockVersion);
      expect(appService.getVersion).toHaveBeenCalled();
    });
  });

  describe('getWebVersion', () => {
    it('should return the web version from config', () => {
      expect(versionController.getWebVersion()).toEqual({ version: '1.0.0' });
      expect(configService.get).toHaveBeenCalledWith('WEB_VERSION', '1.0.0');
    });
  });
}); 