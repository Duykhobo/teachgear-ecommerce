// Synchronization of TypeScript Types matching TechGear Backend API

export type UserRole = 'User' | 'Admin'

export interface User {
  _id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  phone?: string
  address?: string
  createdAt?: string
  updatedAt?: string
}

export interface Product {
  _id: string
  name: string
  description: string
  price: number
  stock: number
  images: string[]
  category: string
  rating?: number
  slug?: string
  createdAt?: string
  updatedAt?: string
}

export interface CartItem {
  _id?: string
  product_id: string
  name: string
  price: number
  quantity: number
  image?: string
}

export interface Cart {
  _id?: string
  user_id: string
  items: CartItem[]
  total_price: number
  total_items: number
}

export type OrderStatus = 'Pending' | 'Processing' | 'Paid' | 'Shipping' | 'Completed' | 'Cancelled'

export interface OrderItem {
  product_id: string
  name: string
  price: number
  quantity: number
  image?: string
}

export interface Order {
  _id: string
  order_code: string
  user_id: string
  items: OrderItem[]
  total_amount: number
  status: OrderStatus
  payment_method: 'SEPAY' | 'COD'
  payment_status: 'UNPAID' | 'PAID'
  shipping_address: string
  qr_code_url?: string
  createdAt: string
  updatedAt: string
}

export interface ApiResponse<T = any> {
  message: string
  data?: T
  result?: T
  status?: number
}

export interface AuthResponse {
  message: string
  result: {
    access_token: string
    refresh_token: string
    user: User
  }
}
