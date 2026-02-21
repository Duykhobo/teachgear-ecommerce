import { Request, Response } from 'express'
import productsService from '~/modules/products/products.service'
import HTTP_STATUS from '~/common/constants/httpStatus'
import { USERS_MESSAGES } from '~/common/constants/messages'

//1. get all products
export const getAllProducts = async (req: Request, res: Response) => {
  const result = await productsService.getAllProducts(req.query as any)
  return res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.GET_ALL_PRODUCTS_SUCCESS,
    result
  })
}

//2. get product by id
export const getProduct = async (req: Request, res: Response) => {
  const { id } = req.params
  const result = await productsService.getProduct(id as string)
  return res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.GET_PRODUCT_SUCCESS,
    result
  })
}

//3. create product
export const createProductController = async (req: Request, res: Response) => {
  const result = await productsService.createProduct(req.body)
  return res.status(HTTP_STATUS.CREATED).json({
    message: 'Create product successfully',
    result
  })
}

//4. soft delete product
export const deleteProductController = async (req: Request, res: Response) => {
  const { id } = req.params
  const result = await productsService.deleteProduct(id as string)
  return res.status(HTTP_STATUS.OK).json({
    message: 'Delete product successfully',
    result
  })
}
