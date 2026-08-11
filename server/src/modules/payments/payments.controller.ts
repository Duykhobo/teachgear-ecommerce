import { Request, Response } from 'express'
import HTTP_STATUS from '~/common/constants/httpStatus'
import sePayService from './sepay.service'

export const sePayIPNController = async (req: Request, res: Response) => {
  const signature = (req.headers['x-sepay-signature'] || req.headers['x-signature']) as string | undefined
  const result = await sePayService.handleIPN(req.body, signature)
  return res.status(HTTP_STATUS.OK).json(result)
}
