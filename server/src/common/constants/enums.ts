/**
 * Trạng thái xác thực tài khoản người dùng
 */
export enum UserVerifyStatus {
  Unverified = 0, // Chưa xác thực email
  Verified = 1, // Đã xác thực email
  Banned = 2 // Tài khoản bị khóa
}

/**
 * Vai trò người dùng trong hệ thống
 */
export enum USER_ROLE {
  Admin = 0, // Quản trị viên
  Staff = 1, // Nhân viên
  User = 2 // Người dùng thông thường
}

/**
 * Loại token được sử dụng
 */
export enum TokenType {
  AccessToken = 0, // Token truy cập
  RefreshToken = 1, // Token làm mới
  ForgotPasswordToken = 2, // Token quên mật khẩu
  EmailVerificationToken = 3 // Token xác thực email
}

/**
 * Loại media được upload
 */
export enum MediaType {
  Image = 0, // Hình ảnh
  Video = 1 // Video
}

/**
 * Trạng thái đơn hàng
 */
export enum OrderStatus {
  Pending = 0, // Chờ xử lý
  Processing = 1, // Đang xử lý
  Shipped = 2, // Đã giao cho đơn vị vận chuyển
  Delivered = 3, // Đã giao thành công
  Cancelled = 4, // Đã hủy
  Completed = 5 // Hoàn thành
}
