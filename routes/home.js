const express = require('express')
const router = express.Router()
const user = require('../controller/userControllers')

router.get('/',user.home)

router.get('/login',user.login)

router.post('/login',user.loginPost)

router.get('/signup',user.signup)

router.post('/signup',user.doSignup)  

router.get('/otp',user.otppage)

router.post('/otpverification',user.otppageverify)

router.get('/OTPResend', user.OTPResend)
  



module.exports = router