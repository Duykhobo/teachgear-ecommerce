import { validate } from '~/common/utils/validation'
import { CreateOrderSchema, UpdateOrderStatusSchema, GetOrdersAdminSchema } from './schemas/orders.schema'

export const createOrderValidator = validate(CreateOrderSchema)
export const updateOrderStatusValidator = validate(UpdateOrderStatusSchema)
export const getOrdersAdminValidator = validate(GetOrdersAdminSchema)
