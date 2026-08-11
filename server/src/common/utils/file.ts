import fs from 'fs' //thư viện giúp handle các đường dẫn
import formidable, { File } from 'formidable'
import HTTP_STATUS from '../constants/httpStatus'
import { ErrorWithStatus } from '../models/Errors'
import { Request } from 'express'
import { UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_DIR, UPLOAD_VIDEO_TEMP_DIR } from '../constants/dir'
export const initFolder = () => {
  ;[UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_TEMP_DIR].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, {
        recursive: true //cho phép tạo folder nested vào nhau
        //uploads/image/bla bla bla
      }) //mkdirSync: giúp tạo thư mục
    }
  })
}

export const handleUploadImageUser = async (req: Request) => {
  const form = formidable({
    uploadDir: UPLOAD_IMAGE_TEMP_DIR,
    maxFiles: 1, //user chỉ up 1 ảnh cho 1 lần muốn thay đổi avatar
    keepExtensions: true,
    maxFileSize: 2 * 1024 * 1024, //2MB
    maxTotalFileSize: 2 * 1024 * 1024,
    //xài option filter để kiểm tra file có phải là image không
    filter: function ({ name, mimetype }) {
      //name: name|key truyền vào của <input name = bla bla>
      //originalFilename: tên file gốc
      //mimetype: kiểu file vd: image/png
      console.log(name, mimetype) //log để xem, nhớ comment

      const valid = name === 'image' && Boolean(mimetype?.includes('image/'))
      //mimetype? nếu là string thì check, k thì thôi
      //ép Boolean luôn, nếu k thì valid sẽ là boolean | undefined

      //nếu sai valid thì dùng form.emit để gữi lỗi
      if (!valid) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        form.emit('error' as any, new ErrorWithStatus({
          message: 'File type is not valid',
          status: HTTP_STATUS.UNSUPPORTED_MEDIA_TYPE
        }) as any)
      }
      //nếu đúng thì return valid
      return valid
    }
  })
  //form.parse về thành promise
  //files là object có dạng giống hình test code cuối cùng
  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, _fields, files) => {
      if (err) {
        return reject(
          new ErrorWithStatus({
            message: err.message,
            status: HTTP_STATUS.BAD_REQUEST
          })
        )
      }
      //nếu files từ req gữi lên không có key image thì reject
      if (!files.image) {
        return reject(
          new ErrorWithStatus({
            message: 'Image is empty',
            status: HTTP_STATUS.BAD_REQUEST
          })
        )
      }
      resolve(files.image as File[])
    })
  })
}

export const handleUploadImageProducts = async (req: Request) => {
  const form = formidable({
    uploadDir: UPLOAD_IMAGE_TEMP_DIR,
    maxFiles: 4, //user chỉ up 4 ảnh cho 1 lần muốn thay đổi ảnh sản phẩm
    keepExtensions: true,
    maxFileSize: 5 * 1024 * 1024, //5MB
    maxTotalFileSize: 20 * 1024 * 1024, //20MB
    //xài option filter để kiểm tra file có phải là image không
    filter: function ({ name, originalFilename, mimetype }) {
      //name: name|key truyền vào của <input name = bla bla>
      //originalFilename: tên file gốc
      //mimetype: kiểu file vd: image/png
      console.log(name, originalFilename, mimetype) //log để xem, nhớ comment

      const valid = name === 'image' && Boolean(mimetype?.includes('image/'))
      //mimetype? nếu là string thì check, k thì thôi
      //ép Boolean luôn, nếu k thì valid sẽ là boolean | undefined

      //nếu sai valid thì dùng form.emit để gữi lỗi
      if (!valid) {
        form.emit(
          'error' as any,
          new ErrorWithStatus({
            message: 'File type is not valid',
            status: HTTP_STATUS.UNSUPPORTED_MEDIA_TYPE
          }) as any
        )
        //as any vì bug này formidable chưa fix, khi nào hết thì bỏ as any
      }
      //nếu đúng thì return valid
      return valid
    }
  })
  //form.parse về thành promise
  //files là object có dạng giống hình test code cuối cùng
  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, _fields, files) => {
      if (err) {
        return reject(
          new ErrorWithStatus({
            message: err.message,
            status: HTTP_STATUS.BAD_REQUEST
          })
        )
      }
      //nếu files từ req gửi lên không có key image thì reject
      if (!files.image) {
        return reject(
          new ErrorWithStatus({
            message: 'Image is empty',
            status: HTTP_STATUS.BAD_REQUEST
          })
        )
      }
      resolve(files.image as File[])
    })
  })
}

export const getNameFromFullName = (fileName: string) => {
  const nameArr = fileName.split('.')
  nameArr.pop()
  return nameArr.join('.')
}

export const getExtension = (filename: string) => {
  const nameArr = filename.split('.')
  return nameArr[nameArr.length - 1]
}

export const handleUploadVideo = async (req: Request) => {
  const form = formidable({
    uploadDir: UPLOAD_VIDEO_DIR, //vì video nên mình không đi qua bước xử lý trung gian nên mình sẽ k bỏ video vào temp
    maxFiles: 1, //tối đa bao nhiêu
    // keepExtensions: true, //có lấy đuôi mở rộng không .png, .jpg "nếu file có dạng asdasd.app.mp4 thì lỗi, nên mình sẽ xử lý riêng
    maxFileSize: 1920 * 1080 * 60, //1920x1080 60fps 10s
    maxTotalFileSize: 1920 * 1080 * 60,
    //xài option filter để kiểm tra file có phải là video không
    filter: function ({ name, mimetype }) {
      const valid = name === 'video' && Boolean(mimetype?.includes('video/'))
      //nếu sai valid thì dùng form.emit để gữi lỗi
      if (!valid) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        form.emit('error' as any, new ErrorWithStatus({
          message: 'File type is not valid',
          status: HTTP_STATUS.BAD_REQUEST
        }) as any)
      }
      return valid
    }
  })

  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, _fields, files) => {
      if (err) {
        return reject(
          new ErrorWithStatus({
            message: err.message,
            status: HTTP_STATUS.BAD_REQUEST
          })
        )
      }
      //files.video k phải image nha
      if (!files.video) {
        return reject(
          new ErrorWithStatus({
            message: 'Video is empty',
            status: HTTP_STATUS.BAD_REQUEST
          })
        )
      }
      //vì k xài keepExtensions nên file sau khi xử lý xong
      // của mình sẽ k có đuôi mở rộng, mình sẽ rename nó để lắp đuôi cho nó
      const videos = files.video as File[]
      videos.forEach((video) => {
        const ext = getExtension(video.originalFilename as string) //lấy đuôi mở rộng của file cũ
        //filepath là đường dẫn đến tên file mới đã mất đuôi mở rộng do k dùng keepExtensions
        fs.renameSync(video.filepath, video.filepath + '.' + ext) //rename lại đường dẫn tên file để thêm đuôi
        video.newFilename = video.newFilename + '.' + ext //newFilename là tên file mới đã mất đuôi mở rộng do k dùng keepExtensions
        //lưu lại tên file mới để return ra bên ngoài, thì method uploadVideo khỏi cần thêm đuôi nữa
      })
      resolve(files.video as File[])
    })
  })
}
