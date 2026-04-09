import { ObjectId } from 'mongodb'
import { OrderStatus } from '~/common/constants/enums'
import { OrderType, OrderItemType, OrderPaymentType, OrderDeliveryType } from '../types/orders.type'

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
