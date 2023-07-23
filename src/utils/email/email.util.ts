import nodemailer, { Transporter } from 'nodemailer';
import pug from 'pug';
import { htmlToText } from 'html-to-text';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import log from '@config/logger.config';
import TemplateManager from './templateManager.util';
import errorHandler from '../errors/decorators/errorHandler.util';
import { UserDocument } from 'src/models/user.model';
import appDetails from '@config/appDetails.config';

const { EMAIL_FROM, NODE_ENV, SENDGRID_USERNAME, SENDGRID_PASSWORD, MAILTRAP_USERNAME, MAILTRAP_PASSWORD } =
  process.env;

interface EmailInterface {
  url?: string;
  to: UserDocument['email'];
  fullName: UserDocument['fullName'];
  from: string;
}

class Email implements EmailInterface {
  url?: string;

  to: string;

  fullName: string;

  from: string;

  /**
   * Creates an instance of the Email class.
   *
   * @param user - User object containing user information.
   * @param url - URL to be included in the email.
   */
  constructor(user: UserDocument, url?: string) {
    this.url = url;
    this.to = user.email;
    this.fullName = (user.fullName as string) || appDetails.generalUserName;
    this.from = `${appDetails.appName} <${EMAIL_FROM || appDetails.emails.from}>`;
  }

  /**
   * Creates a new transporter for sending emails based on the current environment.
   *
   * @returns The created transporter.
   */
  newTransport(): Transporter<SMTPTransport.SentMessageInfo> {
    if (NODE_ENV === 'production')
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: SENDGRID_USERNAME,
          pass: SENDGRID_PASSWORD,
        },
      });

    // MAILTRAP
    return nodemailer.createTransport({
      host: 'smtp.mailtrap.io',
      auth: {
        user: MAILTRAP_USERNAME,
        pass: MAILTRAP_PASSWORD,
      },
    });
  }

  /**
   * Sends an email using the specified template and subject.
   *
   * @param template - The template file name without extension.
   * @param subject - The subject of the email.
   */
  // @catchAsync()
  async send(template: string, subject: string): Promise<void> {
    const html = pug.renderFile(`${__dirname}/../../templates/email/${template}.pug`, {
      firstName: this.fullName,
      url: this.url,
      subject,
    });

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText(html),
    };

    await this.newTransport().sendMail(mailOptions, (err: Error | null, info: any) =>
      log.error(err?.message as string, '......', info),
    );
  }

  /**
   * Sends a welcome email to the user.
   */
  @errorHandler
  async sendWelcome(): Promise<void> {
    await this.send('welcome', `Welcome to the ${appDetails.appName} Family!`);
  }

  /**
   * Sends a password reset email to the user.
   */
  @errorHandler
  async sendPasswordReset(): Promise<void> {
    await this.send('passwordReset', 'Your password reset token (valid for 10 min)');
  }

  /**
   * Composes and sends a custom email to the user.
   *
   * @param template - The template file name without extension.
   * @param subject - The subject of the email.
   * @param variables - The variables to be passed to the email template.
   */
  @errorHandler
  async composeEmail(template: string, subject: string, data: object): Promise<void> {
    // Create an instance of the TemplateManager class
    const templateManager = new TemplateManager();

    // Render the template using the TemplateManager class
    const html = templateManager.render(template, data);

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText(html),
    };

    await this.newTransport().sendMail(mailOptions, (err: Error | null, info: any) =>
      log.error(err?.message as string, '......', info),
    );
  }
}

export default Email;
