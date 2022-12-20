const express = require('express')
const { s3Uploadv2, s3Uploadv3 } = require('../config/s3Service')
const router = express.Router()
const admin = require('../controller/adminControllers')
const fileUpload = require('../middlewears/multer')
const { admincheck, adminCheckAxios } = require('../middlewears/sessioncheck')


router.get('/', admincheck, admin.dashboard)

router.get('/login', admin.adminlogin)

router.post('/login', admin.adminloginPost)

router.get('/logout', admin.adminlogout)

router.get('/Users', admincheck, admin.userview)

router.get('/Block-user/:id', admincheck, admin.blockUser)

router.get('/Unblock-user/:id', admincheck, admin.unblockUser)

router.get('/Products', admincheck, admin.productsView)

router.get('/addProduct', admincheck, admin.addProduct)

router.post('/addProduct', adminCheckAxios, fileUpload.upload.array('image', 4), admin.addProductPost)

router.get('/addBrandName', admincheck, admin.addBrandName)

router.post('/addBrandName', adminCheckAxios, admin.BrandNameUpdate)

router.post('/deleteBrandName', adminCheckAxios, admin.deleteBrandName)

router.put('/EditBrandName', adminCheckAxios, admin.EditBrandName)

router.get('/deleteProduct/:id', admincheck, admin.deleteProduct)

router.get('/editProduct/:id', admincheck, admin.editPage)

router.patch('/editProduct', adminCheckAxios, fileUpload.upload.array('image', 4), admin.updateProduct)

router.get('/genderType', admincheck, admin.genderType)

router.post('/genderType', adminCheckAxios,fileUpload.upload.array('image'), admin.genderTypeAdd)

router.delete('/deleteGender', adminCheckAxios, admin.deleteGender)

router.post('/Editgender', adminCheckAxios, fileUpload.upload.array('image'), admin.editGender)

router.get('/view-product/:id', admincheck, admin.single)

router.get('/orders', admincheck, admin.orders)

router.patch('/deliveryStatus', adminCheckAxios, admin.deliveryStatus)

router.get('/coupen', admincheck, admin.coupen)

router.post('/addCoupen', adminCheckAxios, admin.addCoupen)

router.patch('/coupenStatus', adminCheckAxios, admin.coupenStatus)

router.get('/orderDetail', adminCheckAxios, admincheck, admin.orderDetail)

router.get('/salesReport', admincheck, admin.salesReport)

router.get('/getDetails', adminCheckAxios, admin.getDetails)

module.exports = router    