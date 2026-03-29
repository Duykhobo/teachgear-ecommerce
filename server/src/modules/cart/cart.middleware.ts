import { validate } from '~/common/utils/validation'
import { AddToCartSchema, UpdateCartReqBodySchema } from './schemas/cart.schema'

export const addToCartValidator = validate(AddToCartSchema)
export const updateCartValidator = validate(UpdateCartReqBodySchema)
