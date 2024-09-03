import 'dotenv/config';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { version } from '../package.json';
import { logger } from '@helpers/logger';
import { registerAppGlobals } from '@helpers/registerAppGlobals';

const { PORT = 4010 } = process.env;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await registerAppGlobals(app);
  await app.listen(PORT);
  logger.info(`Server version ${version} is running on http://localhost:${PORT}/swagger`);
}

bootstrap();
