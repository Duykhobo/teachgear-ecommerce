import { ObjectId } from 'mongodb'
import { USER_ROLE, UserVerifyStatus } from '~/constants/enums'

interface Address {
  street: string
  ward: string
  district: string
  city: string
  country: string
  is_default: boolean
}

interface CartItemType {
  product_id: ObjectId
  quantity: number
}

interface UserType {
  _id?: ObjectId
  name: string
  email: string
  date_of_birth?: Date
  password: string
  created_at?: Date
  updated_at?: Date
  email_verify_token?: string
  forgot_password_token?: string
  verify?: UserVerifyStatus
  role?: USER_ROLE
  phone_number?: string
  addresses?: Address[]
  avatar?: string
  cart?: CartItemType[]
}

export default class User {
  _id: ObjectId
  name: string
  email: string
  date_of_birth?: Date
  password: string
  created_at: Date
  updated_at: Date
  email_verify_token?: string
  forgot_password_token?: string
  verify: UserVerifyStatus
  role: USER_ROLE
  phone_number?: string
  addresses: Address[]
  avatar?: string
  cart?: CartItemType[]

  constructor(user: UserType) {
    const date = new Date()
    this._id = user._id || new ObjectId()
    this.name = user.name
    this.email = user.email
    this.date_of_birth = user.date_of_birth || undefined
    this.password = user.password
    this.created_at = user.created_at || date
    this.updated_at = user.updated_at || date
    this.email_verify_token = user.email_verify_token || undefined
    this.forgot_password_token = user.forgot_password_token || undefined
    this.verify = user.verify || UserVerifyStatus.Unverified
    this.role = user.role || USER_ROLE.User
    this.phone_number = user.phone_number || undefined
    this.addresses = user.addresses || []
    this.avatar = user.avatar || undefined
    this.cart = user.cart || []
  }
}
