import { Request, Response } from 'express'
import HTTP_STATUS from '~/common/constants/httpStatus'
import { USERS_MESSAGES } from '~/common/constants/messages'
import { CategoryReqParams, CreateCategoryReqBody, UpdateCategoryReqBody } from './category.schema'
import categoryService from './category.service'

export const createCategoryController = async (req: Request<any, any, CreateCategoryReqBody>, res: Response) => {
  const result = await categoryService.createCategory(req.body)
  return res.status(HTTP_STATUS.CREATED).json({
    message: USERS_MESSAGES.CREATE_CATEGORY_SUCCESS,
    result
  })
}

export const getAllCategoriesController = async (_req: Request, res: Response) => {
  const result = await categoryService.getAllCategories()
  return res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.GET_ALL_CATEGORIES_SUCCESS,
    result
  })
}

export const updateCategoryController = async (
  req: Request<CategoryReqParams, any, UpdateCategoryReqBody>,
  res: Response
) => {
  const { id } = req.params
  const result = await categoryService.updateCategory(id, req.body)
  return res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.UPDATE_CATEGORY_SUCCESS,
    result
  })
}

export const deleteCategoryController = async (req: Request<CategoryReqParams>, res: Response) => {
  const { id } = req.params
  const result = await categoryService.deleteCategory(id)
  return res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.DELETE_CATEGORY_SUCCESS,
    result
  })
}
