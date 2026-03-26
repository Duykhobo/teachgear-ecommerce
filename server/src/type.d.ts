import { TokenPayload } from './models/requests/auth.requests'
import { Request } from 'express'
declare module 'express' {
  interface Request {
    id?: string // Thêm id để lưu Request ID (Correlation ID)
    decoded_authorization?: TokenPayload
    decoded_refresh_token?: TokenPayload
    decoded_email_verify_token?: TokenPayload
    decoded_forgot_password_token?: TokenPayload
  }
}
