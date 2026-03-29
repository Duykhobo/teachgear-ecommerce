import { z } from 'zod'
import { USERS_MESSAGES } from '~/common/constants/messages'

export const CreateCategorySchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, USERS_MESSAGES.CATEGORY_NAME_IS_REQUIRED),
    slug: z
      .string()
      .trim()
      .min(1, USERS_MESSAGES.SLUG_IS_REQUIRED)
      .regex(/^[a-z0-9-]+$/, USERS_MESSAGES.SLUG_MUST_BE_VALID),
    description: z.string().optional()
  })
})

export const UpdateCategoryBodySchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, USERS_MESSAGES.CATEGORY_NAME_IS_REQUIRED).optional(),
    slug: z
      .string()
      .trim()
      .min(1, USERS_MESSAGES.SLUG_IS_REQUIRED)
      .regex(/^[a-z0-9-]+$/, USERS_MESSAGES.SLUG_MUST_BE_VALID)
      .optional(),
    description: z.string().optional()
  })
})

export const CategoryParamsSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, USERS_MESSAGES.INVALID_CATEGORY_ID)
  })
})

export type CreateCategoryReqBody = z.infer<typeof CreateCategorySchema>['body']
export type UpdateCategoryReqBody = z.infer<typeof UpdateCategoryBodySchema>['body']
export type CategoryReqParams = z.infer<typeof CategoryParamsSchema>['params']
