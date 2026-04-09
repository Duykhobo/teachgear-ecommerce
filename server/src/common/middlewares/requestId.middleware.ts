import { Request, Response, NextFunction } from 'express'
import { randomUUID } from 'crypto'

export const requestIdMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  // Gán Request ID duy nhất cho mỗi lượt truy cập bằng thư viện có sẵn của Node (giúp test ổn định hơn)
  req.id = randomUUID()
  next()
}
