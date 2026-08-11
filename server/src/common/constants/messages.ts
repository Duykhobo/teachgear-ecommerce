export const USERS_MESSAGES = {
  /* --- LỖI XÁC THỰC --- */
  VALIDATION_ERROR: 'Dữ liệu không hợp lệ',
  ACCOUNT_NOT_VERIFIED: 'Tài khoản chưa được xác thực',

  // Tên
  NAME_IS_REQUIRED: 'Tên là bắt buộc',
  NAME_MUST_BE_A_STRING: 'Tên phải là chuỗi ký tự',
  NAME_LENGTH_MUST_BE_FROM_1_TO_100: 'Tên phải từ 1-100 ký tự',

  // Email
  EMAIL_IS_REQUIRED: 'Email là bắt buộc',
  INVALID_EMAIL: 'Email không hợp lệ',
  EMAIL_ALREADY_EXISTS: 'Email đã tồn tại',
  EMAIL_NOT_FOUND: 'Email không tồn tại',

  // Mật khẩu
  PASSWORD_IS_REQUIRED: 'Mật khẩu là bắt buộc',
  PASSWORD_MUST_BE_A_STRING: 'Mật khẩu phải là chuỗi ký tự',
  PASSWORD_LENGTH_MUST_BE_FROM_8_TO_50: 'Mật khẩu phải từ 8-50 ký tự',
  PASSWORD_MUST_BE_STRONG: 'Mật khẩu phải chứa ít nhất 1 chữ thường, 1 chữ hoa, 1 số và 1 ký tự đặc biệt',
  PASSWORD_IS_INCORRECT: 'Mật khẩu không đúng',
  PASSWORD_MUST_BE_AT_LEAST_8_CHARACTERS: 'Mật khẩu ít nhất 8 ký tự',

  // Xác nhận mật khẩu
  CONFIRM_PASSWORD_NOT_MATCH: 'Mật khẩu xác nhận không khớp',

  // Ngày sinh
  INVALID_DATE_OF_BIRTH: 'Ngày sinh không hợp lệ',
  DATE_OF_BIRTH_BE_ISO8601: 'Ngày sinh phải theo định dạng ISO8601',

  // Hình ảnh
  IMAGE_URL_MUST_BE_A_STRING: 'URL hình ảnh phải là chuỗi ký tự',
  IMAGE_URL_LENGTH_MUST_BE_LESS_THAN_400: 'URL hình ảnh không quá 400 ký tự',

  // Thông tin cá nhân
  BIO_MUST_BE_A_STRING: 'Tiểu sử phải là chuỗi ký tự',
  BIO_LENGTH_MUST_BE_LESS_THAN_200: 'Tiểu sử không quá 200 ký tự',
  LOCATION_MUST_BE_A_STRING: 'Địa chỉ phải là chuỗi ký tự',
  LOCATION_LENGTH_MUST_BE_LESS_THAN_200: 'Địa chỉ không quá 200 ký tự',
  WEBSITE_MUST_BE_A_STRING: 'Website phải là chuỗi ký tự',
  WEBSITE_LENGTH_MUST_BE_LESS_THAN_200: 'Website không quá 200 ký tự',
  USERNAME_MUST_BE_A_STRING: 'Tên người dùng phải là chuỗi ký tự',
  USERNAME_LENGTH_MUST_BE_LESS_THAN_50: 'Tên người dùng không quá 50 ký tự',
  USERNAME_ALREADY_EXISTS: 'Tên người dùng đã tồn tại',
  USERNAME_IS_INVALID: 'Tên người dùng không hợp lệ',

  /* --- XÁC THỰC --- */
  EMAIL_OR_PASSWORD_IS_INCORRECT: 'Email hoặc mật khẩu không đúng',
  USER_NOT_FOUND: 'Người dùng không tồn tại',
  ACCOUNT_HAS_BEEN_BANNED: 'Tài khoản đã bị khóa',
  USER_NOT_VERIFIED: 'Tài khoản chưa được xác thực',
  EMAIL_ALREADY_VERIFIED_BEFORE: 'Email đã được xác thực trước đó',
  EMAIL_HAS_BEEN_VERIFIED: 'Email đã được xác thực',

  /* --- QUẢN LÝ TOKEN --- */
  ACCESS_TOKEN_IS_REQUIRED: 'Access token là bắt buộc',
  REFRESH_TOKEN_IS_REQUIRED: 'Refresh token là bắt buộc',
  REFRESH_TOKEN_IS_INVALID: 'Refresh token không hợp lệ',
  REFRESH_TOKEN_IS_USED_OR_NOT_EXIST: 'Refresh token đã được sử dụng hoặc không tồn tại',
  EMAIL_VERIFY_TOKEN_IS_REQUIRED: 'Token xác thực email là bắt buộc',
  EMAIL_VERIFY_TOKEN_IS_INVALID: 'Token xác thực email không hợp lệ',
  FORGOT_PASSWORD_TOKEN_IS_REQUIRED: 'Token quên mật khẩu là bắt buộc',
  FORGOT_PASSWORD_TOKEN_NOT_MATCH: 'Token quên mật khẩu không khớp',

  /* --- THÔNG BÁO THÀNH CÔNG --- */
  REGISTER_SUCCESS: 'Đăng ký thành công',
  LOGIN_SUCCESS: 'Đăng nhập thành công',
  GOOGLE_LOGIN_SUCCESS: 'Đăng nhập Google thành công',
  INVALID_GOOGLE_TOKEN: 'Google ID Token không hợp lệ',
  LOGOUT_SUCCESS: 'Đăng xuất thành công',
  EMAIL_VERIFY_SUCCESS: 'Xác thực email thành công',
  RESEND_VERIFY_EMAIL_SUCCESS: 'Gửi lại email xác thực thành công',
  CHECK_EMAIL_TO_RESET_PASSWORD: 'Kiểm tra email để đặt lại mật khẩu',
  VERIFY_FORGOT_PASSWORD_TOKEN_SUCCESS: 'Xác thực token quên mật khẩu thành công',
  RESET_PASSWORD_SUCCESS: 'Đặt lại mật khẩu thành công',
  GET_ME_SUCCESS: 'Lấy thông tin cá nhân thành công',
  UPDATE_PROFILE_SUCCESS: 'Cập nhật hồ sơ thành công',
  UPDATE_ME_SUCCESS: 'Cập nhật thông tin thành công',
  CHANGE_PASSWORD_SUCCESS: 'Đổi mật khẩu thành công',
  REFRESH_TOKEN_SUCCESS: 'Làm mới token thành công',

  /* --- SẢN PHẨM --- */
  PRODUCT_NOT_FOUND: 'Sản phẩm không tồn tại',
  PRODUCT_NAME_IS_REQUIRED: 'Tên sản phẩm là bắt buộc',
  PRODUCT_NAME_MUST_BE_A_STRING: 'Tên sản phẩm phải là chuỗi ký tự',
  PRODUCT_NAME_LENGTH_MUST_BE_FROM_1_TO_100: 'Tên sản phẩm từ 1-100 ký tự',
  PRODUCT_DESCRIPTION_IS_REQUIRED: 'Mô tả sản phẩm là bắt buộc',
  PRODUCT_DESCRIPTION_MUST_BE_A_STRING: 'Mô tả sản phẩm phải là chuỗi ký tự',
  PRODUCT_DESCRIPTION_LENGTH_MUST_BE_FROM_1_TO_1000: 'Mô tả sản phẩm từ 1-1000 ký tự',
  PRICE_MUST_BE_A_POSITIVE_NUMBER: 'Giá phải là số dương',
  STOCK_QUANTITY_MUST_BE_A_NONNEGATIVE_INTEGER: 'Số lượng tồn kho phải là số nguyên không âm',
  INVALID_CATEGORY_ID: 'ID danh mục không hợp lệ',
  INVALID_PRODUCT_ID: 'ID sản phẩm không hợp lệ',
  GET_ALL_PRODUCTS_SUCCESS: 'Lấy danh sách sản phẩm thành công',
  GET_PRODUCT_SUCCESS: 'Lấy thông tin sản phẩm thành công',
  CREATE_PRODUCT_SUCCESS: 'Tạo sản phẩm thành công',
  UPDATE_PRODUCT_SUCCESS: 'Cập nhật sản phẩm thành công',
  DELETE_PRODUCT_SUCCESS: 'Xóa sản phẩm thành công',

  /* --- DANH MỤC --- */
  CATEGORY_NOT_FOUND: 'Danh mục không tồn tại',
  CATEGORY_NAME_IS_REQUIRED: 'Tên danh mục là bắt buộc',
  SLUG_IS_REQUIRED: 'Slug là bắt buộc',
  SLUG_MUST_BE_VALID: 'Slug chỉ chứa chữ thường, số và dấu gạch ngang',
  CREATE_CATEGORY_SUCCESS: 'Tạo danh mục thành công',
  GET_ALL_CATEGORIES_SUCCESS: 'Lấy danh sách danh mục thành công',
  UPDATE_CATEGORY_SUCCESS: 'Cập nhật danh mục thành công',
  DELETE_CATEGORY_SUCCESS: 'Xóa danh mục thành công',
  CATEGORY_IS_USED_BY_PRODUCT: 'Không thể xóa danh mục đang được sử dụng',

  /* --- GIỎ HÀNG --- */
  OUT_OF_STOCK: 'Sản phẩm hết hàng',
  OVER_STOCK_QUANTITY: 'Vượt quá số lượng tồn kho',
  INVALID_QUANTITY: 'Số lượng không hợp lệ',
  CART_IS_EMPTY: 'Giỏ hàng trống',
  ADD_TO_CART_SUCCESS: 'Thêm vào giỏ hàng thành công',
  UPDATE_CART_ITEM_SUCCESS: 'Cập nhật sản phẩm trong giỏ thành công',
  REMOVE_FROM_CART_SUCCESS: 'Xóa khỏi giỏ hàng thành công',
  GET_CART_SUCCESS: 'Lấy giỏ hàng thành công',

  /* --- ĐƠN HÀNG --- */
  ORDER_NOT_FOUND: 'Đơn hàng không tồn tại',
  ADDRESS_IS_REQUIRED: 'Địa chỉ là bắt buộc',
  ADDRESS_MUST_BE_STRING: 'Địa chỉ phải là chuỗi ký tự',
  ADDRESS_LENGTH_MUST_BE_AT_LEAST_5_CHARACTERS: 'Địa chỉ ít nhất 5 ký tự',
  PHONE_NUMBER_IS_REQUIRED: 'Số điện thoại là bắt buộc',
  PHONE_NUMBER_MUST_BE_STRING: 'Số điện thoại phải là chuỗi ký tự',
  PHONE_NUMBER_IS_INVALID: 'Số điện thoại không hợp lệ',
  RECEIVER_NAME_IS_REQUIRED: 'Tên người nhận là bắt buộc',
  RECEIVER_NAME_MUST_BE_STRING: 'Tên người nhận phải là chuỗi ký tự',
  PAYMENT_METHOD_IS_REQUIRED: 'Phương thức thanh toán là bắt buộc',
  PAYMENT_METHOD_MUST_BE_STRING: 'Phương thức thanh toán phải là chuỗi ký tự',
  INVALID_ORDER_STATUS: 'Trạng thái đơn hàng không hợp lệ',
  CREATE_ORDER_SUCCESS: 'Tạo đơn hàng thành công',
  CANCEL_ORDER_SUCCESS: 'Hủy đơn hàng thành công',
  GET_ORDER_SUCCESS: 'Lấy thông tin đơn hàng thành công',
  UPDATE_ORDER_STATUS_SUCCESS: 'Cập nhật trạng thái đơn hàng thành công',
  GET_ORDERS_HISTORY_SUCCESS: 'Lấy lịch sử đơn hàng thành công',

  /* --- MEDIA --- */
  UPLOAD_IMAGE_SUCCESS: 'Upload hình ảnh thành công',
  UPLOAD_VIDEO_SUCCESS: 'Upload video thành công',
  UPLOAD_IMAGE_FAIL: 'Tải ảnh lên thất bại',

  /* --- QUYỀN TRUY CẬP --- */
  FORBIDDEN: 'Không có quyền truy cập: Yêu cầu quyền Admin',
  UNAUTHORIZED: 'Không được ủy quyền: Token thiếu hoặc không hợp lệ',


  /* --- BÁO CÁO --- */
  GET_REVENUE_SUCCESS: 'Lấy báo cáo doanh thu thành công',
  GET_TOP_SELLING_PRODUCTS_SUCCESS: 'Lấy sản phẩm bán chạy thành công'
} as const
