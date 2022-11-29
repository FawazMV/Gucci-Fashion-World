const express = require('express')
const { verifyPayment } = require('../config/payment')
const router = express.Router()
const user = require('../controller/userControllers')
const { getWishlist, addWishlist, deleteWishlist } = require('../controller/wishlistControllers.js')
const { sessionCheck, sessionCheckAxios, loginCheck } = require('../middlewears/sessioncheck')

router.get('/', user.home)

router.get('/login', loginCheck, user.login)

router.post('/login', user.loginPost)

router.get('/signup', loginCheck, user.signup)

router.post('/signup', user.doSignup)

router.get('/otp', user.otppage)

router.post('/otpverification', user.otppageverify)

router.get('/OTPResend', user.OTPResend)

router.get('/singelProduct/:id', user.singleProduct)

router.get('/logout', user.logout)

router.get('/cart', sessionCheck, user.getCart)

router.post('/addCart', sessionCheckAxios, user.addCart)

router.post('/quantityPlus', sessionCheckAxios, user.quantityPlus)

router.post('/cartDelete', sessionCheckAxios, user.cartDelete)

router.get('/checkout', sessionCheck, user.checkout)

router.post('/addAddress', sessionCheckAxios, user.addAddress)

router.get('/getAddress', sessionCheckAxios, user.getAddress)

router.put('/default', sessionCheckAxios, user.dafaultAddress)

router.patch('/deleteAddress', sessionCheckAxios, user.deleteAddress)

router.get('/getEditAddress', sessionCheckAxios, user.getEditAddress)

router.post('/updateAddress', sessionCheckAxios, user.updateAddress)

router.get('/product/:name', user.product)

router.get('/allProduct', user.allProduct)

router.get('/productFilter', user.productFilter)

router.get('/wishlist', sessionCheck, getWishlist)

router.put('/addWhishlist', sessionCheckAxios, addWishlist)

router.delete('/deleteWishlist', sessionCheckAxios, deleteWishlist)

router.put('/placeOrder', sessionCheckAxios, user.placeOrder)

router.post('/verifyPayment', sessionCheckAxios, user.verification)

router.get('/success', sessionCheck, user.success)




module.exports = router