const express = require('express')
const router = express.Router()
const user = require('../controller/userControllers')

router.get('/', user.home)

router.get('/login', user.login)

router.post('/login', user.loginPost)

router.get('/signup', user.signup)

router.post('/signup', user.doSignup)

router.get('/otp', user.otppage)

router.post('/otpverification', user.otppageverify)

router.get('/OTPResend', user.OTPResend)

router.get('/singelProduct/:id', user.singleProduct)

router.get('/logout', user.logout)

router.get('/cart', user.getCart)

router.post('/addCart', user.addCart)

router.post('/quantityPlus', user.quantityPlus)

router.post('/cartDelete', user.cartDelete)

router.get('/checkout', user.checkout)

router.post('/addAddress', user.addAddress)

router.get('/getAddress', user.getAddress)

router.put('/default',user.dafaultAddress)


module.exports = router