import bcrypt from 'bcrypt'
import dotenv from 'dotenv'

dotenv.config()

// Số vòng lặp (Cost factor) để tạo Salt.
// 10 là con số tiêu chuẩn, cân bằng giữa bảo mật và hiệu suất.
const SALT_ROUNDS = 10

/**
 * Hàm băm mật khẩu
 * @param password Mật khẩu thuần (plain text)
 * @returns Promise<string> Mật khẩu đã được mã hóa
 */
export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, SALT_ROUNDS)
}

/**
 * Hàm kiểm tra mật khẩu
 * @param password Mật khẩu người dùng nhập vào
 * @param hashedPassword Mật khẩu đã băm lưu trong Database
 * @returns Promise<boolean> Kết quả đúng hay sai
 */
export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword)
}
