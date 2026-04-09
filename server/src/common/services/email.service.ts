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
    const subject = 'Chào mừng đến với TechGear! Xác thực email của bạn'
    const verificationLink = `http://localhost:${envConfig.PORT || 3000}/auth/verify-email?token=${token}`
    const html = this.getTemplate(
      'Xác thực địa chỉ email',
      `Chào mừng bạn đến với TechGear! Chúng tôi rất vui khi có bạn tham gia.<br/>Vui lòng xác thực địa chỉ email để truy cập tất cả các tính năng của chúng tôi.`,
      'Xác thực Email',
      verificationLink
    )
    await this.sendEmail(to, subject, html)
  }

  async sendForgotPasswordEmail(to: string, token: string) {
    const subject = 'Đặt lại mật khẩu - TechGear'
    const resetLink = `${envConfig.CLIENT_URL}/reset-password?token=${token}`
    const html = this.getTemplate(
      'Đặt lại mật khẩu',
      `Bạn đã yêu cầu đặt lại mật khẩu. Nếu bạn không thực hiện yêu cầu này, bạn có thể bỏ qua email này.<br/>Nhấp vào nút bên dưới để đặt lại mật khẩu.`,
      'Đặt lại mật khẩu',
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
      if (envConfig.SMTP_HOST === 'smtp.ethereal.email') {
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info))
      }
      return info
    } catch (error) {
      console.error('Error sending email:', error)
      throw error
    }
  }

  async sendOrderConfirmationEmail(to: string, orderId: string, totalAmount: number, currency = 'usd') {
    const subject = 'Cảm ơn bạn đã mua sắm tại TechGear!'
    const orderLink = `${envConfig.CLIENT_URL}/orders/${orderId}` // Link Frontend xem đơn hàng

    const isVND = currency.toLowerCase() === 'vnd'
    const locale = isVND ? 'vi-VN' : 'en-US'
    const _currency = currency.toUpperCase()

    // Format tiền tệ động (Dynamic Formatting)
    const formattedAmount = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: _currency
    }).format(totalAmount)

    const html = this.getTemplate(
      'Thanh toán thành công!',
      `Cảm ơn bạn đã mua sắm tại TechGear.<br/><br/>
       Đơn hàng <b>#${orderId}</b> với tổng giá trị <b style="color:#e74c3c;font-size:18px;">${formattedAmount}</b> đã được thanh toán thành công và đang được chuẩn bị.`,
      'Xem Chi Tiết Đơn Hàng',
      orderLink
    )

    await this.sendEmail(to, subject, html)
  }
}

const emailService = new EmailService()
export default emailService
