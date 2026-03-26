import express from 'express'
import databaseServices from './common/services/database.service'
import { defaultErrorHandler } from './common/middlewares/error.middleware'
import dotenv from 'dotenv'
import authRoutes from './modules/auth/auth.route'
import userRoutes from './modules/users/users.route'
import orderRoutes from './modules/orders/orders.route'
import productsRoutes from './modules/products/products.route'

import categoryRoutes from './modules/categories/category.route'
import mediaRoute from './modules/medias/medias.route'
import cartRoutes from './modules/cart/cart.route'
import { initFolder } from './common/utils/file'

dotenv.config()

initFolder()

const app = express() //tạo server

const PORT = process.env.PORT || 3000 //server chạy trên cổng port 3000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

//tạo router

app.use('/auth', authRoutes)
app.use('/users', userRoutes)
app.use('/carts', cartRoutes)
app.use('/orders', orderRoutes)
app.use('/products', productsRoutes)
app.use('/categories', categoryRoutes)
app.use('/medias', mediaRoute)

app.use(defaultErrorHandler)

if (process.env.NODE_ENV !== 'test') {
  databaseServices.connect().then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}`)
    })
  })
}

export default app
