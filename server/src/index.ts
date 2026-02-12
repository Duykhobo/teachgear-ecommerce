import express from 'express'
import databaseServices from './services/database.services'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.routes'

dotenv.config()

const app = express() //tạo server

const PORT = process.env.PORT || 3000 //server chạy trên cổng port 3000

app.use(express.json())

//tạo router

databaseServices.connect()
app.use('/auth', authRoutes)

app.use(defaultErrorHandler)
app.listen(PORT, () => {
  console.log(`Sever is running at http://localhost:${PORT}`)
})
