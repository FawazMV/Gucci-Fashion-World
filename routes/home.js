const { default: axios } = require('axios')
const express = require('express')
const router = express.Router()
const { verifyPayment } = require('../config/payment')
const { placeOrder } = require('../controller/orderControllers')
const { login, signup, home, orderPage, otppage, singleProduct, getCart, checkout, product, allProduct, success, loginPost, doSignup, otppageverify, OTPResend, logout, addCart, quantityPlus, cartDelete, addAddress, getAddress, dafaultAddress, deleteAddress, getEditAddress, updateAddress, productFilter, verification, singleOrder } = require('../controller/userControllers')
const { getWishlist, addWishlist, deleteWishlist } = require('../controller/wishlistControllers.js')
const { sessionCheck, sessionCheckAxios, loginCheck } = require('../middlewears/sessioncheck')


//---------Page rendering routes-----------------/////


router.get('/', home)

router.get('/login', loginCheck, login)

router.get('/signup', loginCheck, signup)

router.get('/otp', otppage)

router.get('/singelProduct/:id', singleProduct)

router.get('/cart', sessionCheck, getCart)

router.get('/checkout', sessionCheck, checkout)

router.get('/product/:name', product)

router.get('/allProduct', allProduct)

router.get('/wishlist', sessionCheck, getWishlist)

router.get('/success', sessionCheck, success)

router.get('/orders', sessionCheck, orderPage)

router.get('/singleOrder/:id', sessionCheck, singleOrder)




//--------<<</END-Page rendering routes----END/>-------------/////


router.post('/login', loginPost)

router.post('/signup', doSignup)

router.post('/otpverification', otppageverify)

router.get('/OTPResend', OTPResend)

router.get('/logout', logout)

//-----------------cart controllers-------///////

router.post('/addCart', sessionCheckAxios, addCart)

router.post('/quantityPlus', sessionCheckAxios, quantityPlus)

router.post('/cartDelete', sessionCheckAxios, cartDelete)

//--------------</END-cart controllers--END/>-----///////


//--------------Address controllers-------///////


router.post('/addAddress', sessionCheckAxios, addAddress)

router.get('/getAddress', sessionCheckAxios, getAddress)

router.put('/default', sessionCheckAxios, dafaultAddress)

router.patch('/deleteAddress', sessionCheckAxios, deleteAddress)

router.get('/getEditAddress', sessionCheckAxios, getEditAddress)

router.post('/updateAddress', sessionCheckAxios, updateAddress)


//-----------</END---Address controllers--END/>-----///////




router.get('/productFilter', productFilter)
//-----------------wishlist controllers-------///////


router.put('/addWhishlist', sessionCheckAxios, addWishlist)

router.delete('/deleteWishlist', sessionCheckAxios, deleteWishlist)

//--------------</END-wishlist controllers--END/>-----///////


router.put('/placeOrder', sessionCheckAxios, placeOrder)

router.post('/verifyPayment', sessionCheckAxios, verification)






module.exports = router