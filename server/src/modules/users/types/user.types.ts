import { ObjectId } from 'mongodb'
import { USER_ROLE, UserVerifyStatus } from '~/common/constants/enums'
import { z } from 'zod'
import { UpdateMeBodySchema, ChangePasswordBodySchema } from '../schemas/user.validation'

// --- Types ---
export type UpdateMeReqBody = z.infer<typeof UpdateMeBodySchema>
export type ChangePasswordReqBody = z.infer<typeof ChangePasswordBodySchema>

export interface Address {
  street: string
  ward: string
  district: string
  city: string
  country: string
  is_default: boolean
}

export interface UserType {
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
}
