const express = require('express')
const { s3Uploadv2, s3Uploadv3 } = require('../config/s3Service')
const router = express.Router()
const admin = require('../controller/adminControllers')
const fileUpload = require('../middlewears/multer')
const { admincheck } = require('../middlewears/sessioncheck')


router.get('/', admincheck, admin.dashboard)

router.get('/login', admin.adminlogin)

router.post('/login', admin.adminloginPost)

router.get('/logout', admin.adminlogout)

router.get('/Users', admincheck, admin.userview)

router.get('/Block-user/:id', admincheck, admin.blockUser)

router.get('/Unblock-user/:id', admincheck, admin.unblockUser)

router.get('/Products', admincheck, admin.productsView)

router.get('/addProduct', admincheck, admin.addProduct)

router.post('/addProduct', fileUpload.upload.array('image', 4), admin.addProductPost)

router.get('/addBrandName', admincheck, admin.addBrandName)

router.post('/addBrandName', admin.BrandNameUpdate)

router.post('/deleteBrandName', admin.deleteBrandName)

router.put('/EditBrandName', admin.EditBrandName)

router.get('/deleteProduct/:id', admincheck, admin.deleteProduct)

router.get('/editProduct/:id', admincheck, admin.editPage)

router.patch('/editProduct', fileUpload.upload.array('image', 4), admin.updateProduct)

router.get('/genderType', admincheck, admin.genderType)

router.post('/genderType', fileUpload.upload.array('image'), admin.genderTypeAdd)

router.delete('/deleteGender', admin.deleteGender)

router.post('/Editgender', fileUpload.upload.array('image'), admin.editGender)

router.get('/view-product/:id', admincheck, admin.single)

router.get('/orders', admincheck, admin.orders)

router.patch('/deliveryStatus', admin.deliveryStatus)

router.get('/coupen', admincheck, admin.coupen)

router.post('/addCoupen', admin.addCoupen)

router.patch('/coupenStatus', admin.coupenStatus)

router.get('/orderDetail', admincheck, admin.orderDetail)

router.get('/salesReport', admincheck, admin.salesReport)

router.get('/getDetails', admin.getDetails)

// router.post('/upload_file', fileUpload.upload.array('image',3), (req, res) => {
//     console.log(req.files)
// })
module.exports = router    