import { z } from 'zod'
import { USERS_MESSAGES } from '~/common/constants/messages'

export const NameSchema = z
  .string()
  .trim()
  .min(1, { message: USERS_MESSAGES.NAME_IS_REQUIRED })
  .max(100, { message: USERS_MESSAGES.NAME_LENGTH_MUST_BE_FROM_1_TO_100 })

export const DateOfBirthSchema = z.string().refine((val) => !isNaN(Date.parse(val)), {
  message: USERS_MESSAGES.DATE_OF_BIRTH_BE_ISO8601
})

export const ImageSchema = z
  .string()
  .trim()
  .max(400, { message: USERS_MESSAGES.IMAGE_URL_LENGTH_MUST_BE_LESS_THAN_400 })
  .optional()

export const BioSchema = z
  .string()
  .trim()
  .max(200, { message: USERS_MESSAGES.BIO_LENGTH_MUST_BE_LESS_THAN_200 })
  .optional()

export const LocationSchema = z
  .string()
  .trim()
  .max(200, { message: USERS_MESSAGES.LOCATION_LENGTH_MUST_BE_LESS_THAN_200 })
  .optional()

export const WebsiteSchema = z
  .string()
  .trim()
  .max(200, { message: USERS_MESSAGES.WEBSITE_LENGTH_MUST_BE_LESS_THAN_200 })
  .optional()

export const UsernameSchema = z
  .string()
  .trim()
  .max(50, { message: USERS_MESSAGES.USERNAME_LENGTH_MUST_BE_LESS_THAN_50 })
  .optional()

export const UpdateMeBodySchema = z.object({
  name: NameSchema.optional(),
  date_of_birth: DateOfBirthSchema.optional(),
  bio: BioSchema,
  location: LocationSchema,
  website: WebsiteSchema,
  username: UsernameSchema,
  avatar: ImageSchema,
  cover_photo: ImageSchema
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

export const UpdateMeSchema = z.object({ body: UpdateMeBodySchema })
export const ChangePasswordSchema = z.object({ body: ChangePasswordBodySchema })
