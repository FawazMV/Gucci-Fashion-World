const bcrypt = require('bcrypt');
const { otpcallin } = require('../config/otp');
const { findById } = require('../models/gender_type-schema');
const genderModel = require('../models/gender_type-schema');
const productModel = require('../models/product-schema');
const usermodel = require('../models/user-schema');

const accoutnSID = process.env.accoutnSID
const serviceSID = process.env.serviceSID
const authToken = process.env.authToken
const client = require("twilio")(accoutnSID, authToken);
let otpstatus, userNumber, userDetails
let resend = true
let user;


module.exports = {
    signup: (req, res) => {
        res.render('userSide/signup', { includes: true })
    },
    login: (req, res) => {
        if (req.session.user) res.redirect('/')
        else res.render('userSide/userlogin', { includes: true })
    },
    home: async (req, res) => {
        let Products = []
        genderModel.find({}).lean().then(async (catagories) => {
            for (let i = 0; i < catagories.length; i++) {
                let products = await productModel.find({ deleteProduct: false, gender: catagories[i]._id }, { imagesDetails: 1, brandName: 1, gender: 1, shopPrice: 1 }).populate('brandName').populate('gender').lean()
                Products.push(products)
            }
            catagories.splice(4)
            user = req.session.user
            res.render('userSide/homepage', { admin: false, Products, catagories, user })
        })
    },
    loginPost: async (req, res) => {
        let response = null
        const user = await usermodel.findOne({ email: req.body.email })
        if (user) {
            await bcrypt.compare(req.body.password, user.password).then(status => {
                if (status) {
                    if (user.isBanned) response = "Your account is blocked temporarly"
                    else {
                        response = false
                        req.session.user = user
                    }
                }
                else response = "Invalid password"
            })
        } else response = "Invalid email"
        res.json({ response })
    },
    doSignup: async (req, res) => {
        if (req.session.user) res.redirect('/')
        else {
            let response = null
            const email = req.body.email
            userDetails = req.body
            userNumber = req.body.mobile
            if (await usermodel.findOne({ email: email })) {
                response = "Email id already exists"
            } else if (await usermodel.findOne({ mobile: userNumber })) {
                response = "Mobile number is already exists";
            }
            else {
                response = null
                otpcallin(userNumber)
                req.session.otp = true
                // res.redirect('/otp')
            }
            res.json({ response })
        }
    },
    otppage: (req, res) => {
        if (req.session.otp) res.render('userSide/otp', { includes: true, userNumber })
        else res.redirect('/login')
    },
    otppageverify: async (req, res) => {
        const { otp } = req.body;
        client.verify.v2.services(serviceSID)
            .verificationChecks
            .create({ to: `+91${userNumber}`, code: otp })
            .then(async response => {
                if (response.valid) {
                    userDetails.password = await bcrypt.hash(userDetails.password, 10)
                    usermodel.create(userDetails).then(() => {
                        req.session.user = userDetails.name
                        req.session.otp = false
                        userDetails = null
                        res.json({ response: true })
                    })
                } else {
                    response
                    res.json({ response: false })
                }
            });
    },
    OTPResend: (req, res) => {
        otpcallin(userNumber)
    },
    singleProduct: (req, res) => {
        let id = req.params.id
        productModel.findById(id).populate('brandName').populate('gender').lean().then(product => {
            res.render('userSide/singleProduct', { product, user })
        })
    },
    logout: (req, res) => {
        req.session.user = false
        res.redirect('/')
    }
}