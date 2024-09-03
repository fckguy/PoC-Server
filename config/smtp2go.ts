import logger from '@helpers/logger';
import * as nodemailer from 'nodemailer';

const {
  SMTP2GO_URL = 'mail.smtp2go.com',
  SMTP2GO_DEFAULT_SENDER = 'Wallaby <noreply@wallaby.cash>',
  SMTP2GO_USERNAME = 'ncwallet.tk',
  SMTP2GO_PORT = '2525',
  SMTP2GO_PASSWORD,
} = process.env;

const transport = nodemailer.createTransport({
  host: SMTP2GO_URL as string,
  port: SMTP2GO_PORT,
  auth: {
    user: SMTP2GO_USERNAME,
    pass: SMTP2GO_PASSWORD,
  },
});

export const smtp2goSendEmail = async ({
  from = SMTP2GO_DEFAULT_SENDER,
  to,
  subject,
  text,
  html,
  bcc,
  cc,
}: {
  from?: string;
  to: string[];
  bcc?: string[];
  cc?: string[];
  subject: string;
  text?: string;
  html: string;
}) => {
  try {
    const res = await transport.sendMail({
      from,
      to,
      bcc,
      cc,
      subject,
      text,
      html,
    });
    return res;
  } catch (error) {
    logger.error(`Error sending email: ${error.message}`, { error });
  }
};
