const express = require('express')
const { s3Uploadv2, s3Uploadv3 } = require('../config/s3Service')
const router = express.Router()
const admin = require('../controller/adminControllers')
const fileUpload = require('../middlewears/multer')


router.get('/', admin.dashboard)

router.get('/login', admin.adminlogin)

router.post('/login', admin.adminloginPost)

router.get('/Users', admin.userview)

router.get('/Block-user/:id', admin.blockUser)

router.get('/Blockedusers', admin.viewBlockedUsers)

router.get('/Unblock-user/:id', admin.unblockUser)

router.get('/Products', admin.productsView)

router.get('/addProduct', admin.addProduct)

router.post('/addProduct', fileUpload.upload.array('image', 5), admin.addProductPost)

router.get('/addBrandName', admin.addBrandName)

router.post('/addBrandName', admin.BrandNameUpdate)

router.post('/deleteBrandName', admin.deleteBrandName)

router.put('/EditBrandName', admin.EditBrandName)

router.get('/deleteProduct/:id', admin.deleteProduct)

router.get('/editProduct/:id', admin.editPage)

router.post('/editProduct', fileUpload.upload.array('image', 5), admin.updateProduct)

router.get('/genderType', admin.genderType)

router.post('/genderType', fileUpload.upload.array('image'), admin.genderTypeAdd)

router.delete('/deleteGender', admin.deleteGender)

router.post('/Editgender', fileUpload.upload.array('image'))

router.post('/Editgender', admin.editGender)

module.exports = router    