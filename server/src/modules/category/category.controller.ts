import { Request, Response } from 'express'
import HTTP_STATUS from '~/common/constants/httpStatus'
import { CreateCategoryReqBody } from './category.schema'
import categoryService from './category.service'

export const createCategoryController = async (req: Request<any, any, CreateCategoryReqBody>, res: Response) => {
  const result = await categoryService.createCategory(req.body)
  return res.status(HTTP_STATUS.CREATED).json({
    message: 'Create category successfully',
    result
  })
}
