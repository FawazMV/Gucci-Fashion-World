const bcrypt = require('bcrypt');
const { otpcallin } = require('../config/otp');
const { findById } = require('../models/gender_type-schema');
const genderModel = require('../models/gender_type-schema');
const productModel = require('../models/product-schema');
const usermodel = require('../models/user-schema');
const brandModel = require('../models/brandName-schema')
//const ObjectId = require('objectid');
const { default: mongoose } = require('mongoose');
const { payment, verifyPayment } = require('../config/payment');
const { OrderID } = require('../config/orderId');
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
        res.render('userSide/userlogin', { includes: true })
    },
    home: async (req, res) => {
        let Products = []
        genderModel.find({}).lean().then(async (catagories) => {
            for (let i = 0; i < 3; i++) {
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
        let userId = req.session.user._id
        usermodel.findById(userId, { cart: 1 }).populate({ path: 'cart.product_id', model: 'Products', populate: { path: 'brandName', model: 'brandName' } })
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
        let userId = req.session.user._id
        let cart = await usermodel.findOne({ _id: userId, 'cart.product_id': req.body.id })
            .catch((error) => res.json({ response: error.message }))
        if (cart) {
            usermodel.aggregate([
                {
                    $match: {
                        _id: mongoose.Types.ObjectId(userId)
                    }
                },
                {
                    $project: {
                        "cart": {
                            $filter: {
                                input: "$cart",
                                cond: {
                                    $eq: [
                                        "$$this.product_id",
                                        mongoose.Types.ObjectId(req.body.id)
                                    ]
                                }
                            }
                        }
                    }
                }]).then((cartquantity) => {
                    productModel.findById(req.body.id, { quantity: 1, _id: -1 }).then(pro => {
                        let { quantity } = pro
                        let count = cartquantity[0].cart[0].quantity + 1
                        if (count <= quantity) {
                            usermodel.updateOne({ _id: userId, 'cart.product_id': req.body.id }, { $inc: { 'cart.$.quantity': 1 } })
                                .then(() => res.json({ response: false }))
                                .catch((error) => res.json({ response: error.message }))
                        }
                        else res.json({ response: "The Product is out of stock" })
                    })
                })
        } else {
            productModel.findById(req.body.id, { quantity: 1, _id: -1 }).then(count => {
                if (count.quantity) {
                    usermodel.findByIdAndUpdate(userId, { $push: { cart: { product_id: req.body.id } } })
                        .then(() => res.json({ response: false }))
                        .catch((error) => res.json({ response: error.message }))
                } else res.json({ response: "The Product is out of stock" })
            }).catch(error => res.json({ response: error.message }))
        }
    },
    quantityPlus: (req, res) => {
        let userId = req.session.user._id
        productModel.findById(req.body.id, { quantity: 1, _id: -1 }).then(pro => {
            let { quantity } = pro
            let count = req.body.count
            if (count <= quantity) {
                usermodel.updateOne({ _id: userId, 'cart._id': req.body.cartid }, { $set: { 'cart.$.quantity': count } }).then(() => {
                    usermodel.findById(userId, { cart: 1 }).populate({ path: 'cart.product_id', model: 'Products' })
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
        let userId = req.session.user._id
        usermodel.findByIdAndUpdate(userId, { $pull: { cart: { _id: req.body.id } } }).then(() => {
            res.json()
        })
    },

    checkout: (req, res) => {
        let userId = req.session.user._id
        usermodel.findById(userId, { cart: 1 }).populate({ path: 'cart.product_id', model: 'Products', populate: { path: 'brandName', model: 'brandName' } })
            .then(async (result) => {
                cartproduct = result.cart
                total = await cartproduct.map(x => x.quantity * x.product_id.shopPrice).reduce((acc, curr) => {
                    acc = acc + curr
                    return acc
                }, 0)
                usermodel.aggregate([
                    {
                        $match: {
                            _id: mongoose.Types.ObjectId(userId)
                        }
                    },
                    {
                        $project: {
                            "address": {
                                $filter: {
                                    input: "$address",
                                    cond: {
                                        $eq: [
                                            "$$this.default",
                                            true
                                        ]
                                    }
                                }
                            }
                        }
                    }
                ]).then(result => {
                    res.render('userSide/checkout', { cartproduct, total, user, address: result[0].address[0] })
                })

            })
    },
    addAddress: (req, res) => {
        let userId = req.session.user._id
        let response = null
        usermodel.findByIdAndUpdate(userId, { $push: { address: req.body } }).then(() => {
            usermodel.findById(userId, { address: 1 }).then(result => {
                res.json({ response: false, address: result.address })
            })
        }).catch(error => res.json({ response: error.message }))
    },
    getAddress: (req, res) => {
        let userId = req.session.user._id
        let response = null
        usermodel.aggregate([
            { $match: { _id: mongoose.Types.ObjectId(userId) } },
            {
                $project:
                {
                    _id: 0,
                    address:
                    {
                        $sortArray: { input: "$address", sortBy: { default: -1 } }
                    }
                }
            }
        ]).then(result => {
            if (result[0].address[0]) res.json({ response: false, address: result[0].address })
            else res.json({ response: "Please add your address" })
        }).catch(error => res.json({ response: error.message }))
    },
    dafaultAddress: (req, res) => {
        let userId = req.session.user._id
        let address = null
        let response = null
        usermodel.updateOne({ _id: userId, 'address.default': true }, { $set: { 'address.$.default': false } }).then(() => {
            usermodel.updateOne({ _id: userId, 'address._id': req.body.id }, { $set: { 'address.$.default': true } }).then(() => {
                res.json({ response: false })
                // usermodel.aggregate([
                //     {
                //         $match: {
                //             _id: mongoose.Types.ObjectId(userId)
                //         }
                //     },
                //     {
                //         $project: {
                //             "address": {
                //                 $filter: {
                //                     input: "$address",
                //                     cond: {
                //                         $eq: [
                //                             "$$this._id",
                //                             mongoose.Types.ObjectId(req.body.id)
                //                         ]
                //                     }
                //                 }
                //             }
                //         }
                //     }
                // ]).then((result) => {
                //  })
            })
        }).catch(error => res.json({ response: error.message }))
    },
    deleteAddress: (req, res) => {
        let userId = req.session.user._id
        usermodel.findByIdAndUpdate(userId, { $pull: { address: { _id: req.body.id } } }).then(() => {
            res.json({})
        })
    },
    getEditAddress: (req, res) => {
        let userId = req.session.user._id
        usermodel.aggregate([
            {
                $match: {
                    _id: mongoose.Types.ObjectId(userId)
                }
            },
            {
                $project: {
                    "address": {
                        $filter: {
                            input: "$address",
                            cond: {
                                $eq: [
                                    "$$this._id",
                                    mongoose.Types.ObjectId(req.query.id)
                                ]
                            }
                        }
                    }
                }
            }
        ]).then(result => {
            console.log(result[0])
            res.json({ address: result[0].address[0] })
        })


    },
    updateAddress: (req, res) => {
        let userId = req.session.user._id
        usermodel.updateMany({ _id: mongoose.Types.ObjectId(userId), 'address._id': mongoose.Types.ObjectId(req.body.id) }, { $set: { 'address.$.firstname': req.body.firstname, 'address.$.lastname': req.body.lastname, 'address.$.address': req.body.address, 'address.$.city': req.body.city, 'address.$.state': req.body.state, 'address.$.pincode': req.body.pincode, 'address.$.phone': req.body.phone } }).then((() => {
            res.redirect('/checkout')
        }))

    },
    product: (req, res) => {
        let type = req.params.name
        if (type == "Men") {
            productModel.find({ gender: "63715c17b25596686e476c80" }).populate('brandName').then(Products => {
                console.log(Products)
                res.render('userSide/productPage', { Products, gender: "Men's", user })
            })
        }
        if (type == "Women") {
            productModel.find({ gender: "637152ce800cd5eacd462106" }).populate('brandName').then(Products => {
                console.log(Products)
                res.render('userSide/productPage', { Products, gender: "Women's", user })
            })
        }
        if (type == "Kid") {
            productModel.find({ gender: "6371ae2419e01e8eec6e14c5" }).populate('brandName').then(Products => {
                console.log(Products)
                res.render('userSide/productPage', { Products, gender: "Kid's", user })
            })
        }
    },
    allProduct: async (req, res) => {
        let gender = await genderModel.find()
        let brands = await brandModel.find()

        productModel.find().populate('brandName').populate('gender').sort({ createdAt: -1 })
            .then(Products => {
                res.locals.Products = Products
                res.render('userSide/allProducts', { gender, user, brands })
            })
    },
    productFilter: (req, res) => {
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
    },
    placeOrder: (req, res) => {
        if (req.body.payment === "online") {
            let userId = req.session.user._id
            usermodel.findById(userId, { cart: 1 }).populate({ path: 'cart.product_id', model: 'Products' })
                .then(async (result) => {
                    cartproduct = result.cart
                    total = await cartproduct.map(x => x.quantity * x.product_id.shopPrice).reduce((acc, curr) => {
                        acc = acc + curr
                        return acc
                    }, 0)
                    payment(total * 100).then((response) => {
                        res.json({ response: response })
                    })
                })
        }
        else {
            OrderID().then((id)=>{
                console.log(id)
                res.json({ response: "cod" })
            })
        }
    },
    verification: (req, res) => {
        verifyPayment(req.body.payment)
            .then(() => {
                res.json({ status: true })
            }).catch(error => res.json({ status: false, error: error.message }))
    },
    success: (req, res) => {
        res.render('userSide/success', { includes: true, user })
    }
}     