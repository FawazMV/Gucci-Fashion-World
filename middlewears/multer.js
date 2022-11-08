const multer = require('multer')
const path = require('path')
// require('../public/product-images')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/product-images')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})


const maxSize = 82428800

exports.upload = multer({
    storage: storage,
    limits: { fileSize: maxSize }
})