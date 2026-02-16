import { NextFunction, Request, Response } from 'express'
import { omit } from 'lodash'
import HTTP_STATUS from '~/common/constants/httpStatus'
import { ErrorWithStatus } from '~/common/models/Errors'

export const defaultErrorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  // Handle JSON parse errors from express.json()
  if (err instanceof SyntaxError && 'body' in err && (err as any).type === 'entity.parse.failed') {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: 'Invalid JSON format. Please check your request body for missing quotes or syntax errors.',
      errorInfor: omit(err, ['stack'])
    })
  }

  //err là lỗi từ các nơi khác truyền xuống, và ta đã quy ước lỗi phải là 1 object có 2 thuộc tính: status và message
  if (err instanceof ErrorWithStatus) {
    //nếu err là 1 instance của ErrorWithStatus
    //thì ta sẽ trả về status và message của err đó
    return res.status(err.status).json(omit(err, ['status']))
  }
  //Object.getOwnPropertyNames(err) trả về 1 mảng các key của err
  //forEach sẽ duyệt qua từng key
  Object.getOwnPropertyNames(err).forEach((key) => {
    //và ta sẽ cho các key của err về enumerable = true
    //để ta có thể lấy được các key đó
    Object.defineProperty(err, key, { enumerable: true })
  })
  return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    message: err.message,
    // errorInfor: err //truyền vậy là truyền lên cả stack(full lỗi và đường dẫn của file lỗi)
    errorInfor: omit(err, ['stack']) //truyền vậy là chỉ truyền lên message
  })
}
