/**
 * Trạng thái xác thực tài khoản người dùng
 */
export enum UserVerifyStatus {
  Unverified = 'Unverified', // Chưa xác thực email
  Verified = 'Verified', // Đã xác thực email
  Banned = 'Banned' // Tài khoản bị khóa
}

/**
 * Vai trò người dùng trong hệ thống
 */
export enum USER_ROLE {
  Admin = 'Admin', // Quản trị viên
  Staff = 'Staff', // Nhân viên
  User = 'User' // Người dùng thông thường
}

/**
 * Loại token được sử dụng (Giữ numeric vì đây là logic internal cực sâu)
 */
export enum TokenType {
  AccessToken = 0,
  RefreshToken = 1,
  ForgotPasswordToken = 2,
  EmailVerificationToken = 3
}

/**
 * Loại media được upload
 */
export enum MediaType {
  Image = 'Image',
  Video = 'Video'
}

/**
 * Trạng thái đơn hàng
 */
export enum OrderStatus {
  Pending = 'Pending', // Chờ xử lý
  Processing = 'Processing', // Đang xử lý
  Shipped = 'Shipped', // Đã giao cho đơn vị vận chuyển
  Delivered = 'Delivered', // Đã giao thành công
  Cancelled = 'Cancelled', // Đã hủy
  Completed = 'Completed' // Hoàn thành
}

/**
 * Phương thức giao hàng
 */
export enum DeliveryMethod {
  Standard = 'Standard', // Giao hàng tiêu chuẩn
  Express = 'Express' // Giao hàng hỏa tốc
}

/**
 * Trạng thái giao hàng chi tiết
 */
export enum DeliveryStatus {
  Pending = 'Pending',
  Processing = 'Processing',
  Shipped = 'Shipped',
  Delivered = 'Delivered',
  Cancelled = 'Cancelled'
}

/**
 * Phương thức thanh toán
 */
export enum PaymentMethod {
  Stripe = 'Stripe',
  COD = 'COD'
}

/**
 * Trạng thái thanh toán
 */
export enum PaymentStatus {
  Pending = 'Pending',
  Paid = 'Paid',
  Refunded = 'Refunded',
  Failed = 'Failed'
}
