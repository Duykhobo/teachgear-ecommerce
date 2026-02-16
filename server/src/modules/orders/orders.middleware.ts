import { validate } from '~/common/utils/validation'
import { CreateOrderSchema } from '~/modules/orders/orders.schema'

export const createOrderValidator = validate(CreateOrderSchema)
