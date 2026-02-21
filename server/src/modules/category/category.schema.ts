import { z } from 'zod'

export const CreateCategorySchema = z.object({
  name: z.string().trim().min(1, 'Category name is required'),
  slug: z
    .string()
    .trim()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9-]+$/, 'Slug must not contain spaces and only lowercase alphanumeric characters and hyphens'),
  description: z.string().optional()
})

export type CreateCategoryReqBody = z.infer<typeof CreateCategorySchema>
