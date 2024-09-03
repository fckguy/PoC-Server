import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): { message: string; environment: string } {
    return {
      message: 'OK',
      environment: process.env.NODE_ENV,
    };
  }
}
