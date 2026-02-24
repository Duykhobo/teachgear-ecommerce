import { z } from 'zod'
import { USERS_MESSAGES } from '~/common/constants/messages'

// Định nghĩa riêng Body Schema
const CreateOrderBodySchema = z.object({
  address: z
    .string({
      error: (issue) => {
        if (issue.code === 'invalid_type' && issue.input === undefined) {
          return { message: USERS_MESSAGES.ADDRESS_IS_REQUIRED }
        }
        return { message: USERS_MESSAGES.ADDRESS_MUST_BE_STRING }
      }
    })
    .min(5, {
      message: USERS_MESSAGES.ADDRESS_LENGTH_MUST_BE_AT_LEAST_5_CHARACTERS
    }),
  phone_number: z
    .string({
      error: (issue) => {
        if (issue.code === 'invalid_type' && issue.input === undefined) {
          return { message: USERS_MESSAGES.PHONE_NUMBER_IS_REQUIRED }
        }
        return { message: USERS_MESSAGES.PHONE_NUMBER_MUST_BE_STRING }
      }
    })
    .regex(/(84|0[3|5|7|8|9])+([0-9]{8})\b/, {
      message: USERS_MESSAGES.PHONE_NUMBER_IS_INVALID
    }),
  receiver_name: z.string({
    error: (issue) => {
      if (issue.code === 'invalid_type' && issue.input === undefined) {
        return { message: USERS_MESSAGES.RECEIVER_NAME_IS_REQUIRED }
      }
      return { message: USERS_MESSAGES.RECEIVER_NAME_MUST_BE_STRING }
    }
  }),
  payment_method: z.string({
    error: (issue) => {
      if (issue.code === 'invalid_type' && issue.input === undefined) {
        return { message: USERS_MESSAGES.PAYMENT_METHOD_IS_REQUIRED }
      }
      return { message: USERS_MESSAGES.PAYMENT_METHOD_MUST_BE_STRING }
    }
  })
})

// Bọc nó vào field 'body' để Middleware validation hiểu
export const CreateOrderSchema = z.object({
  body: CreateOrderBodySchema
})

import { OrderStatus } from '~/common/constants/enums'
import { ObjectId } from 'mongodb'

// Dùng cái này ném cho Service!
export type CreateOrderReqBody = z.infer<typeof CreateOrderBodySchema>

export const UpdateOrderStatusBodySchema = z.object({
  status: z.nativeEnum(OrderStatus, {
    message: USERS_MESSAGES.INVALID_ORDER_STATUS
  })
})

export const UpdateOrderStatusSchema = z.object({
  body: UpdateOrderStatusBodySchema
})

export type UpdateOrderStatusReqBody = z.infer<typeof UpdateOrderStatusBodySchema>

interface OrderItemType {
  product_id: ObjectId
  name: string
  image: string
  quantity: number
  price: number
}
interface OrderPaymentType {
  payment_method: string
  payment_status: string
  payment_id: string
}

interface OrderDeliveryType {
  delivery_method: string
  delivery_status: string
  address: string
  phone_number: string
  receiver_name: string
  shipping_fee?: number
}
interface OrderType {
  _id?: ObjectId
  user_id: ObjectId
  order_items: OrderItemType[]
  total_amount: number
  status: OrderStatus
  created_at?: Date
  updated_at?: Date
  payment: OrderPaymentType
  delivery: OrderDeliveryType
}

export default class Order {
  _id: ObjectId
  user_id: ObjectId
  order_items: OrderItemType[]
  total_amount: number
  status: OrderStatus
  created_at: Date
  updated_at: Date
  payment: OrderPaymentType
  delivery: OrderDeliveryType

  constructor(order: OrderType) {
    this._id = order._id || new ObjectId()
    this.user_id = order.user_id
    this.order_items = order.order_items
    this.total_amount = order.total_amount
    this.status = order.status
    this.created_at = order.created_at || new Date()
    this.updated_at = order.updated_at || new Date()
    this.payment = order.payment
    this.delivery = {
      ...order.delivery,
      shipping_fee: order.delivery.shipping_fee ?? 0
    }
  }
}
