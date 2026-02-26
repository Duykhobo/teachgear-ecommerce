import { Request } from 'express'
import { handleUploadImage, handleUploadVideo } from '~/common/utils/file'
import { Media } from './type'
import { MediaType } from '~/common/constants/enums'
import fs from 'fs'
import cloudinary from 'cloudinary'
import { envConfig } from '~/common/configs/configs'
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})
class MediasService {
  async uploadImage(req: Request) {
    const files = handleUploadImage(req)

    const result: Media[] = await Promise.all(
      (await files).map(async (file) => {
        const filePath = file.filepath
        try {
          const uploadResult = await cloudinary.v2.uploader.upload(filePath, {
            folder: 'techgear-ecommerce/products',
            use_filename: true
          })

          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath)
          }

          return {
            url: uploadResult.secure_url,
            type: MediaType.Image
          }
        } catch (error) {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath)
          }
          throw error
        }
      })
    )
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
