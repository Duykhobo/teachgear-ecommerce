export const USERS_MESSAGES = {
  /* --- VALIDATION (KIỂM TRA DỮ LIỆU ĐẦU VÀO) --- */
  VALIDATION_ERROR: 'Validation error',

  // Name Validation
  NAME_IS_REQUIRED: 'Name is required',
  NAME_MUST_BE_A_STRING: 'Name must be a string',
  NAME_LENGTH_MUST_BE_FROM_1_TO_100: 'Name length must be from 1 to 100',

  // Email Validation
  EMAIL_IS_REQUIRED: 'Email is required',
  INVALID_EMAIL: 'Invalid email address',
  EMAIL_NOT_FOUND: 'Email not found',

  //Image Validation
  IMAGE_URL_LENGTH_MUST_BE_LESS_THAN_400: 'Image URL length must be less than 400',
  IMAGE_URL_MUST_BE_A_STRING: 'Image URL must be a string',

  // Password Validation
  PASSWORD_IS_REQUIRED: 'Password is required',
  PASSWORD_MUST_BE_A_STRING: 'Password must be a string',
  PASSWORD_LENGTH_MUST_BE_FROM_8_TO_50: 'Password length must be from 8 to 50',
  PASSWORD_MUST_BE_STRONG:
    'Password must be at least 8 characters long and contain at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 symbol',
  PASSWORD_IS_INCORRECT: 'Password is incorrect',

  // Confirm Password Validation
  CONFIRM_PASSWORD_IS_REQUIRED: 'Confirm password is required',
  CONFIRM_PASSWORD_MUST_BE_A_STRING: 'Confirm password must be a string',
  CONFIRM_PASSWORD_LENGTH_MUST_BE_FROM_8_TO_50: 'Confirm length must be from 8 to 50',
  CONFIRM_PASSWORD_MUST_BE_STRONG:
    'Confirm password must be at least 8 characters long and contain at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 symbol',
  CONFIRM_PASSWORD_MUST_BE_THE_SAME_AS_PASSWORD: 'Confirm password must be the same as password',

  // Date Validation
  DATE_OF_BIRTH_BE_ISO8601: 'Date of birth must be ISO8601',

  //Bio Validation
  BIO_MUST_BE_A_STRING: 'Bio must be a string',
  BIO_LENGTH_MUST_BE_LESS_THAN_200: 'Bio length must be less than 200',
  //Location Validation
  LOCATION_MUST_BE_A_STRING: 'Location must be a string',
  LOCATION_LENGTH_MUST_BE_LESS_THAN_200: 'Location length must be less than 200',

  //Website Validation
  WEBSITE_MUST_BE_A_STRING: 'Website must be a string',
  WEBSITE_LENGTH_MUST_BE_LESS_THAN_200: 'Website length must be less than 200',

  //Username Validation
  USERNAME_MUST_BE_A_STRING: 'Username must be a string',
  USERNAME_LENGTH_MUST_BE_LESS_THAN_50: 'Username length must be less than 50',
  USERNAME_ALREADY_EXISTS: 'Username already exists',
  USERNAME_IS_INVALID: 'Username is invalid',

  /* --- AUTHENTICATION & ACCOUNT (TÀI KHOẢN & ĐĂNG NHẬP) --- */
  // Login & Register
  EMAIL_ALREADY_EXISTS: 'Email already exists',
  EMAIL_OR_PASSWORD_IS_INCORRECT: 'Email or password is incorrect',
  USER_NOT_FOUND: 'User not found',
  ACCOUNT_HAS_BEEN_BANNED: 'Account has been banned',
  USER_NOT_VERIFIED: 'User not verified',
  CONFIRM_PASSWORD_NOT_MATCH: 'Confirm password not match',
  PASSWORD_MUST_BE_AT_LEAST_8_CHARACTERS: 'Password must be at least 8 characters',
  PASSWORD_MUST_BE_LESS_THAN_50_CHARACTERS: 'Password must be less than 50 characters',
  INVALID_DATE_OF_BIRTH: 'Invalid date of birth',

  // Verify Email Status
  EMAIL_ALREADY_VERIFIED_BEFORE: 'Email already verified before',
  EMAIL_HAS_BEEN_VERIFIED: 'Email has been verified',

  /* --- TOKEN MANAGEMENT (QUẢN LÝ TOKEN & BẢO MẬT) --- */
  // Access & Refresh Token
  ACCESS_TOKEN_IS_REQUIRED: 'Access token is required',
  REFRESH_TOKEN_IS_REQUIRED: 'Refresh token is required',
  REFRESH_TOKEN_IS_INVALID: 'Refresh token is invalid',
  REFRESH_TOKEN_IS_USED_OR_NOT_EXIST: 'Refresh token is used or not exist',

  // Verify Tokens (Email & Forgot Password)
  EMAIL_VERIFY_TOKEN_IS_REQUIRED: 'Email verify token is required',
  EMAIL_VERIFY_TOKEN_IS_INVALID: 'Email verify token is invalid',
  FORGOT_PASSWORD_TOKEN_IS_REQUIRED: 'Forgot password token is required',
  FORGOT_PASSWORD_TOKEN_NOT_MATCH: 'Forgot password token not match',

  /* --- SUCCESS MESSAGES (THÔNG BÁO THÀNH CÔNG) --- */
  REGISTER_SUCCESS: 'Register success',
  LOGIN_SUCCESS: 'Login success',
  LOGOUT_SUCCESS: 'Logout success',
  EMAIL_VERIFY_SUCCESS: 'Email verify success',
  RESEND_VERIFY_EMAIL_SUCCESS: 'Resend verify email success',
  CHECK_EMAIL_TO_RESET_PASSWORD: 'Check email to reset password',
  VERIFY_FORGOT_PASSWORD_TOKEN_SUCCESS: 'Verify forgot password token success',
  RESET_PASSWORD_SUCCESS: 'Reset password success',
  GET_ME_SUCCESS: 'Get me success',
  UPDATE_PROFILE_SUCCESS: 'Update profile success',
  CHANGE_PASSWORD_SUCCESS: 'Change password success',
  REFRESH_TOKEN_SUCCESS: 'Refresh token success',
  UPLOAD_IMAGE_SUCCESS: 'Upload image success',
  UPLOAD_VIDEO_SUCCESS: 'Upload video success'
} as const
