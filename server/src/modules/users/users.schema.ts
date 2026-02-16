import { z } from 'zod'
import { ObjectId } from 'mongodb'
import { USER_ROLE, UserVerifyStatus } from '~/common/constants/enums'
import { USERS_MESSAGES } from '~/common/constants/messages'

// --- Body Schemas ---
export const AddToCartBodySchema = z.object({
  product_id: z.string().trim().min(1),
  quantity: z.number().int().positive()
})

export const UpdateMeBodySchema = z.object({
  name: z.string().trim().optional(),
  date_of_birth: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: USERS_MESSAGES.INVALID_DATE_OF_BIRTH
    })
    .optional(),
  bio: z.string().trim().optional(),
  location: z.string().trim().optional(),
  website: z.string().trim().optional(),
  username: z.string().trim().optional(),
  avatar: z.string().trim().optional(),
  cover_photo: z.string().trim().optional()
})

export const ChangePasswordBodySchema = z
  .object({
    old_password: z.string().min(8),
    password: z.string().min(8),
    confirm_password: z.string().min(8)
  })
  .strict()
  .superRefine(({ confirm_password, password }, ctx) => {
    if (confirm_password !== password) {
      ctx.addIssue({
        code: 'custom',
        message: USERS_MESSAGES.CONFIRM_PASSWORD_NOT_MATCH,
        path: ['confirm_password']
      })
    }
  })

// --- Request Schemas (for middleware) ---
export const AddToCartSchema = z.object({ body: AddToCartBodySchema })
export const UpdateMeSchema = z.object({ body: UpdateMeBodySchema })
export const ChangePasswordSchema = z.object({ body: ChangePasswordBodySchema })

// --- Types ---
export type AddToCartReqBody = z.infer<typeof AddToCartBodySchema>
export type UpdateMeReqBody = z.infer<typeof UpdateMeBodySchema>
export type ChangePasswordReqBody = z.infer<typeof ChangePasswordBodySchema>

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
