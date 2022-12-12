const { default: mongoose } = require("mongoose")
const { subTotal } = require("../helpers/order_Helpers")
const productModel = require("../models/product-schema")
const usermodel = require("../models/user-schema")

exports.getCart = (req, res) => {
    try {
        let user = req.session.user.name
        let userId = req.session.user._id
        usermodel.findById(userId, { cart: 1 }).populate({ path: 'cart.product_id', model: 'Products', populate: { path: 'brandName', model: 'brandName' } })
            .then(async (result) => {
                let cartproduct = result.cart
                let total = await subTotal(userId)
                res.render('userSide/cart', { cartproduct, total, user })
            })
    } catch (error) {
        console.log(error)  
    }
} 

exports.addCart = async (req, res) => {
    try {
        let userId = req.session.user._id
        let cart = await usermodel.findOne({ _id: userId, 'cart.product_id': req.body.id })
            .catch((error) => res.json({ response: error.message }))
        if (cart) {
            usermodel.aggregate([{ $match: { _id: mongoose.Types.ObjectId(userId) } },
            { $project: { "cart": { $filter: { input: "$cart", cond: { $eq: ["$$this.product_id", mongoose.Types.ObjectId(req.body.id)] } } } } }])
                .then((cartquantity) => {
                    productModel.findById(req.body.id, { quantity: 1, shopPrice: 1, _id: -1 }).then(pro => {
                        let price = pro.shopPrice;
                        let { quantity } = pro
                        let count = cartquantity[0].cart[0].quantity + 1
                        if (count <= quantity) {
                            let total = price * count
                            usermodel.updateOne({ _id: userId, 'cart.product_id': req.body.id }, { $inc: { 'cart.$.quantity': 1 }, $set: { 'cart.$.total': total } })
                                .then(() => res.json({ response: false }))
                                .catch((error) => res.json({ response: error.message }))
                        }
                        else res.json({ response: "The Product is out of stock" })
                    })
                })
        } else {
            productModel.findById(req.body.id, { quantity: 1, shopPrice: 1, _id: -1 }).then(count => {
                if (count.quantity) {
                    let price = count.shopPrice;
                    let total = price
                    usermodel.findByIdAndUpdate(userId, { $push: { cart: { product_id: req.body.id, total: total } } })
                        .then(() => res.json({ response: false }))
                        .catch((error) => {
                            res.json({ response: error.message })
                        })
                } else res.json({ response: "The Product is out of stock" })
            }).catch(error => res.json({ response: error.message }))
        }
    } catch (error) {
        console.log(error)
    }
}
exports.quantityPlus = (req, res) => {
    try {
        let userId = req.session.user._id
        productModel.findById(req.body.id, { quantity: 1, _id: -1, shopPrice: 1 }).then(pro => {
            let { quantity } = pro
            let count = req.body.count
            let price = pro.shopPrice;
            let totalsing = price * count
            if (count <= quantity) {
                usermodel.updateOne({ _id: userId, 'cart._id': req.body.cartid }, { $set: { 'cart.$.quantity': count, 'cart.$.total': totalsing } }).then(() => {
                    subTotal(userId).then(async (total) => res.json({ response: true, total: total }))
                })
            }
            else {
                totalsing = price * quantity
                usermodel.updateOne({ _id: userId, 'cart._id': req.body.cartid }, { $set: { 'cart.$.quantity': quantity, 'cart.$.total': totalsing } }).then(() => {
                    res.json({ response: false })
                })

            }
        })
    } catch (error) {
        console.log(error)
    }
}
exports.cartDelete = (req, res) => {
    try {
        let userId = req.session.user._id
        usermodel.findByIdAndUpdate(userId, { $pull: { cart: { _id: req.body.id } } }).then(() => {
            res.json()
        })
    } catch (error) {
        console.log(error)
    }
}
