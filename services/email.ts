import 'dotenv/config';
import { smtp2goSendEmail } from '@config/smtp2go';
import logger from '@helpers/logger';

const { DOMAIN = 'wallaby.cash' } = process.env;

interface ITemplate {
  text: string;
  button?: {
    text: string;
    link: string;
  };
}

const brandColor = '#05445E';

export const template = ({ text, button }: ITemplate): string => `
  <div style="background-color:#f9f9f9; font-family: Roboto, Arial, Helvetica, sans-serif; padding: 15px;">
    <div style="max-width:640px;margin:0 auto; border: 1px solid #f0f0f0; border-top:5px solid ${brandColor};overflow:hidden; background-color: #fff; padding: 10px;">
      <table style="width: 100%"">
        <tr>
          <td style="padding: 15px 0px; font-size: 1.3rem;">
            ${text}
            ${
              button?.link
                ? `
                  <div style="margin: 20px 0px; text-align: center;">
                    <a
                      href="${button.link}" 
                      style="background-color: ${brandColor}; color: #fff; padding: 10px 50px; border-radius: 5px; text-decoration: none;"
                      rel="noreferrer"
                      _target="blank"
                    >
                    ${button.text}
                    </a>
                  </div>
                `
                : ''
            }
          </td>
        </tr>
        <tr>
          <td style="word-break:break-word;font-size:0px;">
            <p style="font-size:1px;margin:0px auto;border-top:1px solid #dcddde;width:100%"></p>
          </td>
        </tr>
        <tr>
          <td style="color: #707070; padding: 0px;">
            Need help? Contact our support team via support@${DOMAIN || 'wallaby.cash'}
          </td>
        </tr>
      </table>
    </div>
    <div style="margin:0px auto;max-width:640px;background:transparent; font-size: 11px;">
      <p style="text-align: center;">
        Copyright © ${new Date().getFullYear()} Wallaby<br>
      <p>
    </div>
  </div>
`;

export const sendEmail = async ({
  from = 'Wallaby <noreply@wallaby.cash>',
  subject,
  to,
  text,
  bcc,
  cc,
  button,
}: {
  subject: string;
  from?: string;
  to?: Array<string>;
  bcc?: Array<string>;
  cc?: Array<string>;
  text: string;
  button?: {
    text: string;
    link: string;
  };
}): Promise<void> => {
  try {
    const html = template({ text, button });
    const payload: any = { html, from, subject };
    if (to) {
      payload.to = to;
    }

    if (bcc) {
      payload.bcc = bcc;
    }

    if (cc) {
      payload.cc = cc;
    }

    if (bcc || to) {
      const res = await smtp2goSendEmail(payload);
      logger.info(res);
    }
  } catch (error) {
    logger.error(`Error sending email: ${error.message}`, { error });
  }
};
