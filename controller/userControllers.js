const bcrypt = require('bcrypt');
const { otpcallin, otpVeryfication } = require('../config/otp');
const { findById } = require('../models/gender_type-schema');
const genderModel = require('../models/gender_type-schema');
const productModel = require('../models/product-schema');
const usermodel = require('../models/user-schema');
const brandModel = require('../models/brandName-schema')
const { default: mongoose } = require('mongoose');
const { payment, verifyPayment } = require('../config/payment');
const { OrderID } = require('../config/orderId');
const orders_Model = require('../models/order-schema');
const { subTotal, OrderPush, coupenCheck } = require('../helpers/order_Helpers');
const review_model = require('../models/review_schema');
const accoutnSID = process.env.accoutnSID
const serviceSID = process.env.serviceSID
const authToken = process.env.authToken
const client = require("twilio")(accoutnSID, authToken);
let userNumber, userDetails
let user;



/////---------------------page rendering--------------------/////////

exports.signup = (req, res) => {
    try {
        res.render('userSide/signup', { includes: true })
    } catch (error) {
        console.log(error)
    }
}
exports.login = (req, res) => {
    try {
        res.render('userSide/userlogin', { includes: true })
    } catch (error) {
        console.log(error)
    }
}
exports.forgetPassword = (req, res) => {
    try {
        res.render('userSide/forget', { includes: true })
    } catch (error) {
        console.log(error)
    }
}
exports.home = async (req, res) => {
    try {
        let Products = []
        genderModel.find({}).lean().then(async (catagories) => {
            for (let i = 0; i < 3; i++) {
                let products = await productModel.find({ deleteProduct: false, gender: catagories[i]._id, quantity: { $gt: 1 } }, { imagesDetails: 1, brandName: 1, gender: 1, shopPrice: 1, rating: 1 })
                    .populate('brandName').populate('gender').lean()
                Products.push(products)
            }
            catagories.splice(4)
            user = req.session.user
            res.render('userSide/homepage', { admin: false, Products, catagories, user })
        })
    } catch (error) {
        console.log(error)
    }
}
exports.otppage = (req, res) => {
    try {
        if (req.session.otp) res.render('userSide/otp', { includes: true, userNumber })
        else res.redirect('/login')
    } catch (error) {
        console.log(error)
    }
}
exports.singleProduct = async (req, res) => {
    try {
        let id = req.params.id
        let review = [] = await review_model.find({ product: id }).populate('user', 'name').sort({ _id: -1 })
        productModel.findById(id).populate('brandName').populate('gender').lean().then(async product => {
            let similiar = [] = await productModel.find({ deleteProduct: false, gender: product.gender._id, type: product.type, _id: { $ne: id }, quantity: { $gt: 1 } }, { imagesDetails: 1, brandName: 1, gender: 1, shopPrice: 1, review: 1, rating: 1 })
                .populate('brandName').populate('gender').lean()
            res.render('userSide/singleProduct', { product, user, review, similiar })
        })
    } catch (error) {
        console.log(error)
    }
}

exports.checkout = (req, res) => {
    try {
        let userId = req.session.user._id
        usermodel.findById(userId, { cart: 1, cartDiscout: 1 }).populate({ path: 'cart.product_id', model: 'Products', populate: { path: 'brandName', model: 'brandName' } })
            .then(async (result) => {
                let cartproduct = result.cart
                let disc = result.cartDiscout
                let total = await subTotal(userId)
                let aftTotal = total
                let discount = "00";
                usermodel.aggregate([
                    { $match: { _id: mongoose.Types.ObjectId(userId) } },
                    { $project: { "address": { $filter: { input: "$address", cond: { $eq: ["$$this.default", true] } } } } }
                ])
                    .then(async result => {
                        if (disc) {
                            let resp = await coupenCheck(disc, userId)
                            aftTotal = resp.subtotal
                            discount = resp.discout
                        }
                        res.render('userSide/checkout', { cartproduct, total, discount, aftTotal, user, address: result[0].address[0] })
                    })
            })
    } catch (error) {
        console.log(error)
    }
}
exports.product = (req, res) => {
    try {
        let type = req.params.name
        if (type == "Men") {
            productModel.find({ gender: "63715c17b25596686e476c80" }).populate('brandName').then(Products => {
                res.render('userSide/productPage', { Products, gender: "Men's", user })
            })
        }
        if (type == "Women") {
            productModel.find({ gender: "637152ce800cd5eacd462106" }).populate('brandName').then(Products => {
                res.render('userSide/productPage', { Products, gender: "Women's", user })
            })
        }
        if (type == "Kid") {
            productModel.find({ gender: "6371ae2419e01e8eec6e14c5" }).populate('brandName').then(Products => {
                res.render('userSide/productPage', { Products, gender: "Kid's", user })
            })
        }
    } catch (error) {
        console.log(error)
    }
}
exports.allProduct = async (req, res) => {
    try {
        let gender = await genderModel.find()
        let brands = await brandModel.find()
        productModel.find().populate('brandName').populate('gender').sort({ createdAt: -1 })
            .then(Products => {
                res.locals.Products = Products
                res.render('userSide/allProducts', { gender, user, brands })
            })
    } catch (error) {
        console.log(error)
    }
}
exports.success = (req, res) => {
    try {
        res.render('userSide/success', { includes: true, user })
    } catch (error) {
        console.log(error)
    }
}

///------------------renderPageend---------------//






exports.loginPost = async (req, res) => {
    try {
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
    } catch (error) {
        console.log(error)
    }
}
exports.doSignup = async (req, res) => {
    try {
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
    } catch (error) {
        console.log(error)
    }
}
exports.otppageverify = async (req, res) => {
    try {
        const { otp } = req.body;
        otpVeryfication(otp, userNumber).then(async (response) => {
            if (response) {
                userDetails.password = await bcrypt.hash(userDetails.password, 10)
                usermodel.create(userDetails).then((e) => {
                    req.session.user = e
                    req.session.otp = false
                    userDetails = null
                    res.json({ response: true })
                })
            } else {
                res.json({ response: false })
            }
        })
    } catch (error) {
        console.log(error)
    }
}
exports.OTPResend = (req, res) => {
    try {
        otpcallin(userNumber)
    } catch (error) {
        console.log(error)
    }
}
exports.logout = (req, res) => {
    try {
        req.session.user = false
        res.redirect('/')
    } catch (error) {
        console.log(error)
    }
}
exports.forgetemail = (req, res) => {
    try {
        let response = null
        usermodel.findOne({ email: req.body.email }, { _id: 0, mobile: 1 }).then(user => {
            if (user) {
                otpcallin(user.mobile)
                res.json({ mobile: user.mobile })
            } else {
                res.json({ response: 'Email id not found' })
            }
        })
    } catch (error) {
        console.log(error)
    }
}
exports.otpForget = (req, res) => {
    try {
        let { otp, userNumber } = req.body;
        otpVeryfication(otp, userNumber).then((response) => {
            if (response) {
                res.json({ response: true })
            } else {
                res.json({ response: false })
            }
        })
    } catch (error) {
        console.log(error)
    }
}
exports.changePassword = async (req, res) => {
    try {
        let { password, email } = req.body
        password = await bcrypt.hash(password, 10)
        usermodel.updateOne({ email: email }, { $set: { password: password } }).then((e) => {
            res.json()
        })
    } catch (error) {
        console.log(error)
    }
}
exports.productFilter = (req, res) => {
    try {
        let gender = req.query.gender
        let brand = req.query.brand
        let sortt = req.query.sortt
        if (sortt == "shopPrice") {
            if (!gender && !brand) {
                productModel.find({}).populate('brandName').populate('gender').sort({ shopPrice: -1, }).
                    then(Products => {
                        res.json({ Products: Products })
                    })
            } else if (!gender) {
                productModel.find({ brandName: { $in: brand } }).populate('brandName').populate('gender').sort({ shopPrice: -1 }).
                    then(Products => {
                        res.json({ Products: Products })
                    })
            } else if (!brand) {
                productModel.find({ gender: { $in: gender } }).populate('brandName').populate('gender').sort({ shopPrice: -1 }).
                    then(Products => {
                        res.json({ Products: Products })
                    })
            }
            else {
                productModel.find({
                    $and: [
                        { gender: { "$in": gender } },
                        { brandName: { "$in": brand } }
                    ]
                }).populate('brandName').populate('gender').sort({ shopPrice: -1 }).
                    then(Products => {
                        res.json({ Products: Products })
                    })
            }
        }
        else {
            if (!gender && !brand) {
                productModel.find({}).populate('brandName').populate('gender').sort({ createdAt: -1 }).
                    then(Products => {
                        res.json({ Products: Products })
                    })

            } else if (!gender) {
                productModel.find({ brandName: { $in: brand } }).populate('brandName').populate('gender').sort({ createdAt: -1 }).
                    then(Products => {
                        res.json({ Products: Products })
                    })
            } else if (!brand) {
                productModel.find({ gender: { $in: gender } }).populate('brandName').populate('gender').sort({ createdAt: -1 }).
                    then(Products => {
                        res.json({ Products: Products })
                    })
            }
            else {
                productModel.find({
                    $and: [
                        { gender: { "$in": gender } },
                        { brandName: { "$in": brand } }
                    ]
                }).populate('brandName').populate('gender').sort({ createdAt: -1 }).
                    then(Products => {
                        res.json({ Products: Products })
                    })
            }
        }
    } catch (error) {
        console.log(error) 
    }
}
exports.verification = (req, res) => {
    try {
        let userId = req.session.user._id
        let total = req.body.amount / 100
        let id = req.body.orderId
        verifyPayment(req.body.payment)
            .then(() => {
                OrderPush(userId, id, total, 'Online').then(() => res.json({ status: true }))
            }).catch(error => res.json({ status: false, error: error.message }))
    } catch (error) {
        console.log(error)
    }
}

exports.review = (req, res) => {
    try {
        let userId = req.session.user._id
        let { rating, review, id, title } = req.body
        rating = rating * 20
        const reviews = {}
        reviews.rating = rating
        reviews.product = id
        reviews.user = userId
        reviews.review = review
        reviews.title = title
        review_model.create(reviews).then(async () => {
            let rat = {} = await productModel.findById(id, { _id: 0, rating: 1 })
            if (rat.rating) rating = (rating + rat.rating) / 2
            await productModel.findByIdAndUpdate(id, { $inc: { review: 1, }, $set: { rating: rating } })
            res.json()
        })
    } catch (error) {
        console.log(error)
    }
}