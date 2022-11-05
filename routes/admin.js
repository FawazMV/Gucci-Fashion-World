const express = require('express')
const router = express.Router()
const admin = require('../controller/adminControllers')
const usermodel = require("../models/user-schema")


router.get('/', admin.dashboard)

router.get('/login', admin.adminlogin)

router.post('/login', admin.adminloginPost)

router.get('/Users', admin.userview)

router.get('/Block-user/:id', admin.blockUser)

router.get('/Blockedusers',admin.viewBlockedUsers)

router.get('/Unblock-user/:id', admin.unblockUser)

router.get('/Products', admin.productsView)

module.exports = router