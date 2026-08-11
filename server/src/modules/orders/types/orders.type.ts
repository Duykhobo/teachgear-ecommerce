import { ObjectId } from 'mongodb'
import {
  OrderStatus,
  DeliveryMethod,
  DeliveryStatus,
  PaymentMethod,
  PaymentStatus
} from '~/common/constants/enums'

export interface OrderItemType {
  product_id: ObjectId
  name: string
  image: string
  quantity: number
  price: number
}

export interface OrderPaymentType {
  payment_method: PaymentMethod
  payment_status: PaymentStatus
  payment_id: string
}

export interface OrderDeliveryType {
  delivery_method: DeliveryMethod
  delivery_status: DeliveryStatus
  address: string
  phone_number: string
  receiver_name: string
  shipping_fee?: number
}

export interface OrderType {
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
