import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { TokenPayload } from '~/models/requests/user.requests'

dotenv.config()
//Payload: nội dung cần lưu
//PrivateKey: chữ ký bí mật của server
//option: chuẩn mã hóa, ngày hết hạn
export const signToken = ({
  payload, //
  privateKey,
  options = { algorithm: 'HS256' }
}: {
  payload: object | string | Buffer
  privateKey: string
  options?: jwt.SignOptions
}) => {
  return new Promise<string>((resolve, reject) => {
    jwt.sign(payload, privateKey, options, (error, token) => {
      if (error) return reject(error)
      resolve(token as string)
    })
  })
}

//hàm nhận vào token, kiểm tra token hợp lệ, trả về payload
//payload thông tin của user
export const verifyToken = ({ token, privateKey }: { token: string; privateKey: string }) => {
  return new Promise<TokenPayload>((resolve, reject) => {
    jwt.verify(token, privateKey, (error, decoded) => {
      if (error) return reject(error)
      return resolve(decoded as TokenPayload)
    })
  })
}
