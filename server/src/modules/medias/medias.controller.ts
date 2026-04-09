import { Request, Response } from 'express'
import HTTP_STATUS from '~/common/constants/httpStatus'
import { USERS_MESSAGES } from '~/common/constants/messages'
import mediasService from './meadias.service'
import { UserVerifyStatus } from '~/common/constants/enums'
import { ErrorWithStatus } from '~/common/models/Errors'
import { TokenPayload } from '../auth/auth.schema'
import usersService from '../users/users.service'
import fs from 'fs'
import mime from 'mime-types'
import { UPLOAD_VIDEO_DIR } from '~/common/constants/dir'
import path from 'path'
import { handleUploadImageProducts, handleUploadImageUser } from '~/common/utils/file'

export const uploadVideoController = async (req: Request, res: Response) => {
  const result = await mediasService.uploadVideo(req)
  return res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.UPLOAD_VIDEO_SUCCESS,
    result
  })
}

export const uploadUserAvatarController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload

  const user = await usersService.findUserById(user_id)

  if (user.verify === UserVerifyStatus.Unverified) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.ACCOUNT_NOT_VERIFIED,
      status: HTTP_STATUS.UNAUTHORIZED
    })
  } else if (user.verify === UserVerifyStatus.Banned) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.ACCOUNT_HAS_BEEN_BANNED,
      status: HTTP_STATUS.UNAUTHORIZED
    })
  }

  const files = await handleUploadImageUser(req)

  const singleFile = files[0]

  const result = await mediasService.uploadAvatarMethod(singleFile)

  return res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.UPLOAD_IMAGE_SUCCESS,
    result
  })
}

export const uploadProductImageController = async (req: Request, res: Response) => {
  const files = await handleUploadImageProducts(req)

  const result = await mediasService.uploadProductImageMethod(files)

  return res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.UPLOAD_IMAGE_SUCCESS,
    result
  })
}

export const serveVideoStreamController = async (req: Request, res: Response) => {
  const { namefile } = req.params //lấy namefile từ param string
  const range = req.headers.range
  const videoPath = path.resolve(UPLOAD_VIDEO_DIR, namefile as string) //đường dẫn tới file video
  const videoSize = fs.statSync(videoPath).size //ở đây tính theo byte
  //nếu k có range thì trả về toàn bộ video
  if (!range) {
    const contentType = mime.lookup(videoPath) || 'video/*'
    const headers = {
      'Content-Length': videoSize,
      'Content-Type': contentType
    }
    res.writeHead(HTTP_STATUS.OK, headers)
    const videoStreams = fs.createReadStream(videoPath)
    videoStreams.pipe(res)
    return
  }
  //dung lượng cho mỗi phân đoạn muốn stream
  const CHUNK_SIZE = 10 ** 6 //10^6 = 1MB
  //lấy giá trị byte bắt đầu từ header range (vd: bytes=8257536-29377173/29377174)
  //8257536 là cái cần lấy
  const start = Number(range.replace(/\D/g, '')) //lấy số đầu tiên từ còn lại thay bằng ''

  //lấy giá trị byte kết thúc-tức là khúc cần load đến
  const end = Math.min(start + CHUNK_SIZE, videoSize - 1) //nếu (start + CHUNK_SIZE) > videoSize thì lấy videoSize
  //dung lượng sẽ load thực tế
  const contentLength = end - start + 1 //thường thì nó luôn bằng CHUNK_SIZE, nhưng nếu là phần cuzối thì sẽ nhỏ hơn

  const contentType = mime.lookup(videoPath) || 'video/*' //lấy kiểu file, nếu k đc thì mặc định là video/*
  const headers = {
    'Content-Range': `bytes ${start}-${end}/${videoSize}`, //end-1 vì nó tính từ 0
    'Accept-Ranges': 'bytes',
    'Content-Length': contentLength,
    'Content-Type': contentType
  }
  res.writeHead(HTTP_STATUS.PARTIAL_CONTENT, headers) //trả về phần nội dung
  //khai báo trong httpStatus.ts PARTIAL_CONTENT = 206: nội dung bị chia cắt nhiều đoạn
  const videoStreams = fs.createReadStream(videoPath, { start, end }) //đọc file từ start đến end
  videoStreams.pipe(res)
  //pipe: đọc file từ start đến end, sau đó ghi vào res để gữi cho client
}
