import { smtp2goSendEmail } from './smtp2go';

describe('smtp2goSendEmail', () => {
  it('should call sendEmail', async () => {
    const res = await smtp2goSendEmail({
      from: 'email@email.com',
      to: ['test@email.com'],
      subject: 'Test email',
      html: 'Hello, <p>Unit testing the email</p>',
    });

    expect(res).toBeDefined();
  });
});
