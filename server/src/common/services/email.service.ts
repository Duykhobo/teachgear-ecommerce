import nodemailer from 'nodemailer'
import { envConfig } from '~/common/configs/configs'

class EmailService {
  private transporter

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: envConfig.SMTP_HOST,
      port: envConfig.SMTP_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: envConfig.SMTP_USERNAME,
        pass: envConfig.SMTP_PASSWORD
      }
    })
  }

  async sendVerifyEmail(to: string, token: string) {
    const subject = 'Welcome to TechGear! Verify your email'
    const verificationLink = `${envConfig.CLIENT_URL}/auth/verify-email?email_verify_token=${token}`
    const html = this.getTemplate(
      'Verify Your Email Address',
      `Welcome to TechGear! We're excited to have you on board.<br/>Please verify your email address to get access to all our features.`,
      'Verify Email',
      verificationLink
    )
    await this.sendEmail(to, subject, html)
  }

  async sendForgotPasswordEmail(to: string, token: string) {
    const subject = 'Reset Your Password - TechGear'
    const resetLink = `${envConfig.CLIENT_URL}/reset-password?token=${token}`
    const html = this.getTemplate(
      'Reset Your Password',
      `You requested to reset your password. If you didn't make this request, you can safely ignore this email.<br/>Click the button below to reset your password.`,
      'Reset Password',
      resetLink
    )
    await this.sendEmail(to, subject, html)
  }

  private getTemplate(title: string, content: string, buttonText: string, link: string) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background-color: #333; color: #fff; padding: 20px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px; }
          .content { padding: 30px 20px; text-align: center; }
          .content h2 { margin-top: 0; color: #333; }
          .content p { margin-bottom: 25px; color: #666; font-size: 16px; }
          .button { display: inline-block; padding: 12px 30px; background-color: #007bff; color: white !important; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; transition: background-color 0.3s; }
          .button:hover { background-color: #0056b3; }
          .footer { background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 12px; color: #999; }
          .link-fallback { margin-top: 20px; font-size: 14px; color: #999; word-break: break-all; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>TechGear</h1>
          </div>
          <div class="content">
            <h2>${title}</h2>
            <p>${content}</p>
            <a href="${link}" class="button">${buttonText}</a>
            <div class="link-fallback">
              <p>Or copy and paste this link into your browser:</p>
              <a href="${link}" style="color: #007bff;">${link}</a>
            </div>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} TechGear. All rights reserved.</p>
            <p>This is an automated message, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  private async sendEmail(to: string, subject: string, html: string) {
    try {
      const info = await this.transporter.sendMail({
        from: `"${envConfig.EMAIL_FROM_NAME}" <${envConfig.EMAIL_FROM_ADDRESS}>`,
        to,
        subject,
        html
      })
      console.log('Message sent: %s', info.messageId)
    } catch (error) {
      console.error('Error sending email:', error)
    }
  }
}

const emailService = new EmailService()
export default emailService
