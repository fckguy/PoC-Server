import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Health Check API' })
  @ApiResponse({ status: 200, description: 'App is up and running' })
  getHello(): { message: string } {
    return this.appService.getHello();
  }
}
