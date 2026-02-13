export interface UpdateMeReqBody {
  name?: string
  date_of_birth?: string
  bio?: string
  location?: string
  website?: string
  username?: string
  avatar?: string
  cover_photo?: string
}
export interface ChangePasswordReqBody {
  old_password: string
  password: string
  confirm_password: string
}

export interface AddToCartReqBody {
  product_id: string
  quantity: number
}
