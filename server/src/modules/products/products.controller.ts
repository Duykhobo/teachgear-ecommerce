import { Request, Response } from 'express'
import productsService from '~/modules/products/products.service'
import {
  ProductReqParams,
  UpdateProductReqBody,
  CreateProductReqBody,
  ProductWithCategory,
  PaginationReqQuery
} from './types/product.types'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/common/constants/httpStatus'
import { USERS_MESSAGES } from '~/common/constants/messages'
import { USER_ROLE } from '~/common/constants/enums'
import { TokenPayload } from '../auth/types/auth.types'

// Helper function to bifurcate data (Senior Move)
const filterByRole = (product: ProductWithCategory, role?: USER_ROLE) => {
  if (role === USER_ROLE.Admin) return product // Admin thấy tuốt

  // User/Guest chỉ thấy vài thông tin quan trọng
  const { name, price, description, images, sold_quantity, category_detail, _id } = product
  return { _id, name, price, description, images, sold_quantity, category_detail }
}

//1. get all products
export const getAllProducts = async (req: Request, res: Response) => {
  const role = (req.decoded_authorization as TokenPayload)?.role
  const data = await productsService.getAllProducts(
    ((req as { parsedQuery?: PaginationReqQuery } & Request).parsedQuery || req.query) as PaginationReqQuery
  )

  // Map lại kết quả dựa trên role
  const filteredProducts = data.products.map((p: ProductWithCategory) => filterByRole(p, role))

  return res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.GET_ALL_PRODUCTS_SUCCESS,
    result: {
      ...data,
      products: filteredProducts
    }
  })
}
//2. get product by id
export const getProduct = async (req: Request<ProductReqParams>, res: Response) => {
  const { id } = req.params
  const role = (req.decoded_authorization as TokenPayload)?.role
  const result = (await productsService.getProduct(id as string)) as ProductWithCategory

  return res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.GET_PRODUCT_SUCCESS,
    result: filterByRole(result, role)
  })
}

//3. create product
export const createProductController = async (
  req: Request<ParamsDictionary, unknown, CreateProductReqBody>,
  res: Response
) => {
  const result = await productsService.createProduct(req.body)
  return res.status(HTTP_STATUS.CREATED).json({
    message: USERS_MESSAGES.CREATE_PRODUCT_SUCCESS,
    result
  })
}

//4. soft delete product
export const deleteProductController = async (req: Request<ProductReqParams>, res: Response) => {
  const { id } = req.params
  const result = await productsService.deleteProduct(id as string)
  return res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.DELETE_PRODUCT_SUCCESS,
    result
  })
}

//5. update product
export const updateProductController = async (
  req: Request<ProductReqParams, unknown, UpdateProductReqBody>,
  res: Response
) => {
  const { id } = req.params
  const result = await productsService.updateProduct(id, req.body)
  return res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.UPDATE_PRODUCT_SUCCESS,
    result
  })
}

//6. get top selling products
export const getTopSellingProductsController = async (req: Request, res: Response) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 10
  const role = (req.decoded_authorization as TokenPayload)?.role
  const products = await productsService.getTopSellingProducts(limit)

  const result = (products as ProductWithCategory[]).map((p: ProductWithCategory) => filterByRole(p, role))

  return res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.GET_TOP_SELLING_PRODUCTS_SUCCESS,
    result
  })
}
