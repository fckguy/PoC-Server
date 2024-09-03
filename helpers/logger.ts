import 'dotenv/config';
import winston, { transports, format } from 'winston';
import dayjs from 'dayjs';

import { DATADOG_API_KEY, isCronApp } from '@constants/env';

const { NODE_ENV, NETWORK } = process.env;

const transportsList: Array<any> = [new winston.transports.Console()];

// Setup DATADOG only if the API KEY is set
if (DATADOG_API_KEY) {
  let service = `ncw_wallet_api_${NODE_ENV}_${NETWORK}`.toLowerCase();
  if (isCronApp) {
    service += '_cron';
  }

  transportsList.push(
    new transports.Http({
      host: 'http-intake.logs.datadoghq.com',
      path: `/api/v2/logs?dd-api-key=${DATADOG_API_KEY}&ddsource=ncw&service=${service}`,
      ssl: true,
    }),
  );
}

// Create a Winston logger that streams to Stackdriver Logging
// Logs will be written to: "projects/PROJECT_ID/logs/winston_log"
export const logger = winston.createLogger({
  level: 'info',
  format: format.combine(
    format.printf(({ level, message, timestamp, meta }) => {
      return JSON.stringify({ level, meta, message, timestamp: dayjs(timestamp).format() });
    }),
  ),
  transports: transportsList,
});

export default logger;
