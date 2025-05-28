import cloudinary from '@utils/files/cloudinary.js'
import multer from 'multer'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: 'posts',
      resource_type: 'image', // đảm bảo Cloudinary xử lý ảnh
      public_id: file.originalname.split('.')[0]
    }
  }
})

const upload = multer({ storage })

export default upload
