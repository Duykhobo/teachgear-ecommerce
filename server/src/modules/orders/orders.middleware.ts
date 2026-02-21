import { validate } from '~/common/utils/validation'
import { CreateOrderSchema, UpdateOrderStatusSchema } from '~/modules/orders/orders.schema'

export const createOrderValidator = validate(CreateOrderSchema)
export const updateOrderStatusValidator = validate(UpdateOrderStatusSchema)
