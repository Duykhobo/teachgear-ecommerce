import { ZodError } from 'zod'

/**
 * Chuyển đổi mảng lỗi thô của Zod thành một object key-value đơn giản.
 * Ví dụ: { "email": "Email không hợp lệ", "password": "Mật khẩu quá ngắn" }
 */
export const formatZodErrors = (error: ZodError) => {
  const formattedErrors: Record<string, string> = {}

  error.issues.forEach((issue) => {
    // Lấy tên trường bị lỗi (nằm ở vị trí cuối cùng trong mảng path)
    // Ví dụ path của Zod thường là: ['body', 'email'] -> ta lấy 'email'
    const fieldName = issue.path[issue.path.length - 1]

    // Chỉ lấy thông báo lỗi đầu tiên của mỗi trường để tránh spam UI
    if (fieldName && !formattedErrors[fieldName.toString()]) {
      formattedErrors[fieldName.toString()] = issue.message
    }
  })

  return formattedErrors
}
