import { z } from 'zod'

// --- Body Schemas ---
export const AddToCartBodySchema = z.object({
  product_id: z.string().trim().min(1),
  quantity: z.number().int().positive()
})

// --- Request Schemas (for middleware) ---
export const UpdateCartReqBodySchema = z.object({
  body: z.object({
    quantity: z.number().int().positive()
  })
})

export const AddToCartSchema = z.object({ body: AddToCartBodySchema })

// --- Types ---
export type AddToCartReqBody = z.infer<typeof AddToCartBodySchema>
export type UpdateCartReqBody = z.infer<typeof UpdateCartReqBodySchema>
