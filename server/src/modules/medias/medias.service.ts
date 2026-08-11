import { File } from 'formidable'
import { Request } from 'express'
import { handleUploadVideo, getNameFromFullName } from '~/common/utils/file'
import { Media } from './types/medias.type'
import { MediaType } from '~/common/constants/enums'
import fs from 'fs'
import cloudinary from 'cloudinary'
import { envConfig } from '~/common/configs/configs'
import sharp from 'sharp'
import { ErrorWithStatus } from '~/common/models/Errors'
import { USERS_MESSAGES } from '~/common/constants/messages'
import HTTP_STATUS from '~/common/constants/httpStatus'
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})
class MediasService {
  async uploadAvatarMethod(file: File) {
    const filepath = file.filepath
    const newFilepath = filepath + '.webp'
    try {
      await sharp(filepath).resize(500, 500).webp().toFile(newFilepath)

      const result = await cloudinary.v2.uploader.upload(newFilepath, {
        folder: 'techgear/avatars',
        public_id: getNameFromFullName(file.newFilename)
      })
      return {
        url: result.secure_url
      }
    } catch (error) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.UPLOAD_IMAGE_FAIL,
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR
      })
    } finally {
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath)
      }
      if (fs.existsSync(newFilepath)) {
        fs.unlinkSync(newFilepath)
      }
    }
  }

  async uploadProductImageMethod(files: File[]) {
    const uploadPromises = files.map(async (file) => {
      const filepath = file.filepath
      try {
        const result = await cloudinary.v2.uploader.upload(filepath, {
          folder: 'techgear/product-images',
          public_id: getNameFromFullName(file.newFilename)
        })
        return {
          url: result.secure_url
        }
      } catch (error) {
        throw new ErrorWithStatus({
          message: `Error upload image product ${file.originalFilename}`,
          status: HTTP_STATUS.INTERNAL_SERVER_ERROR
        })
      } finally {
        if (fs.existsSync(filepath)) {
          fs.unlinkSync(filepath)
        }
      }
    })

    const result = await Promise.all(uploadPromises)
    return result
  }

  async uploadVideo(req: Request) {
    const files = await handleUploadVideo(req)
    const result: Media[] = files.map((file) => {
      return {
        url: `http://localhost:${envConfig.PORT || 3000}/medias/video-stream/${file.newFilename}`,
        type: MediaType.Video
      }
    })
    return result
  }
}

const mediasService = new MediasService()

export default mediasService
