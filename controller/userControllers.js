const bcrypt = require('bcrypt');
const { otpcallin } = require('../config/otp');
const { findById } = require('../models/gender_type-schema');
const genderModel = require('../models/gender_type-schema');
const productModel = require('../models/product-schema');
const usermodel = require('../models/user-schema');
//const ObjectId = require('objectid');
const { default: mongoose } = require('mongoose');
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
                    usermodel.create(userDetails).then((e) => {
                        req.session.user = e
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
    },
    getCart: (req, res) => {
        let user = req.session.user._id
        usermodel.findById(user, { cart: 1 }).populate({ path: 'cart.product_id', model: 'Products', populate: { path: 'brandName', model: 'brandName' } })
            .then(async (result) => {
                cartproduct = result.cart
                total = await cartproduct.map(x => x.quantity * x.product_id.shopPrice).reduce((acc, curr) => {
                    acc = acc + curr
                    return acc
                }, 0)
                res.render('userSide/cart', { cartproduct, total, user })
            })
    },
    addCart: async (req, res) => {
        let user = req.session.user._id
        let cart = await usermodel.findOne({ _id: user, 'cart.product_id': req.body.id })
            .catch((error) => res.json({ response: error.message }))

        if (cart) {
            usermodel.updateOne({ _id: user, 'cart.product_id': req.body.id }, { $inc: { 'cart.$.quantity': 1 } })
                .then(() => res.json({ response: false }))
                .catch((error) => res.json({ response: error.message }))
        } else {
            productModel.findById(req.body.id, { quantity: 1, _id: -1 }).then(count => {
                if (count.quantity) {
                    usermodel.findByIdAndUpdate(user, { $push: { cart: { product_id: req.body.id } } })
                        .then(() => res.json({ response: false }))
                        .catch((error) => res.json({ response: error.message }))
                } else res.json({ response: "The Product is out of stock" })
            }).catch(error => res.json({ response: error.message }))
        }
    },
    quantityPlus: (req, res) => {
        let user = req.session.user._id
        productModel.findById(req.body.id, { quantity: 1, _id: -1 }).then(pro => {
            let { quantity } = pro
            let count = req.body.count
            if (count <= quantity) {
                usermodel.updateOne({ _id: user, 'cart._id': req.body.cartid }, { $set: { 'cart.$.quantity': count } }).then(() => {
                    usermodel.findById(user, { cart: 1 }).populate({ path: 'cart.product_id', model: 'Products' })
                        .then(async (result) => {
                            cartproduct = result.cart
                            total = await cartproduct.map(x => x.quantity * x.product_id.shopPrice).reduce((acc, curr) => {
                                acc = acc + curr
                                return acc
                            }, 0)
                            res.json({ response: true, total: total })
                        })
                })
            }
            else res.json({ response: false })
        })
    },
    cartDelete: (req, res) => {
        let user = req.session.user._id
        usermodel.findByIdAndUpdate(user, { $pull: { cart: { _id: req.body.id } } }).then(() => {
            res.json()
        })
    },

    checkout: (req, res) => {
        let user = req.session.user._id
        usermodel.findById(user, { cart: 1 }).populate({ path: 'cart.product_id', model: 'Products', populate: { path: 'brandName', model: 'brandName' } })
            .then(async (result) => {
                cartproduct = result.cart
                total = await cartproduct.map(x => x.quantity * x.product_id.shopPrice).reduce((acc, curr) => {
                    acc = acc + curr
                    return acc
                }, 0)
                res.render('userSide/checkout', { cartproduct, total, user })
            })
    },
    addAddress: (req, res) => {
        let user = req.session.user._id
        let response = null
        usermodel.findByIdAndUpdate(user, { $push: { address: req.body } }).then(() => {
            usermodel.findById(user, { address: 1 }).then(result => {
                res.json({ response: false, address: result.address })
            })
        }).catch(error => res.json({ response: error.message }))
    },
    getAddress: (req, res) => {
        let user = req.session.user._id
        let response = null
        usermodel.findById(user, { address: 1 }, { sort: { 'address.default': 1} })
            .then(result => {
                console.log(result)
                res.json({ response: false, address: result.address })
            }).catch(error => res.json({ response: error.message }))
    },
    dafaultAddress: (req, res) => {
        let user = req.session.user._id
        let response = null
        console.log('aldshfakl' + req.body.id)
        usermodel.updateOne({ _id: user, 'address.default': true }, { $set: { 'address.$.default': false } }).then(() => {
            usermodel.updateOne({ _id: user, 'address._id': req.body.id }, { $set: { 'address.$.default': true } }).then(() => {
                console.log('finished')
            })
        })

    }
}