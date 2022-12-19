const { default: mongoose } = require("mongoose")
const { OrderID } = require("../config/orderId")
const { payment } = require("../config/payment")
const { subTotal, OrderPush, inventory, percentage, coupenCheck, walletAdd } = require("../helpers/order_Helpers")
const orders_Model = require("../models/order-schema")
const usermodel = require("../models/user-schema")
const moment = require('moment')
const coupn_Model = require("../models/coupen_schema")
const { findById } = require("../models/user-schema")


exports.orderPage = (async (req, res, next) => {
    try {
        let user = req.session.user.name
        let userId = req.session.user._id
        await orders_Model.find({ User: mongoose.Types.ObjectId(userId) }).populate('OrderDetails.product_id').sort({ _id: -1 })
            .then((order) => {
                res.render('userSide/orders', { user, order })
            })
            .catch((error) => next(error))
    } catch (error) {
        next(error)
    }
})

exports.singleOrder = (async (req, res, next) => {
    try {
        let user = req.session.user.name
        let order = await orders_Model.findById(req.params.id).populate({ path: 'OrderDetails.product_id', model: 'Products', populate: { path: 'brandName', model: 'brandName' } }).sort({ _id: -1 })
        res.render('userSide/singleOrder', { user, order })
    } catch (error) {
        next(error)
    }
})
exports.placeOrder = async (req, res, next) => {
    try {
        let userId = req.session.user._id
        let add = await usermodel.findOne({ _id: userId, 'address.default': true })
        if (!add) res.json({ addreserrr: true })
        else {
            let total = await subTotal(userId)
            if (req.body.payment === "online") {
                if (add.cartDiscout) {
                    let resp = await coupenCheck(add.cartDiscout, userId).then(resp => {
                        total = resp.subtotal
                    })
                }
                OrderID().then(orderId => {
                    payment(total * 100, orderId).then((response) => res.json({ response: response }))
                })
            }
            else if (req.body.payment === "cod") {
                OrderID().then(async (id) => {
                    OrderPush(userId, id, total, 'COD').then(() => {
                        res.json({ response: "cod" })
                    })
                })
            } else if (req.body.payment === "wallet") {
                let { wallet } = await usermodel.findById(userId, { wallet: 1, _id: 0 }).catch(error => next(error))
                let discout = 0
                wallet = wallet.balance
                if (add.cartDiscout) {
                    discout = await coupenCheck(add.cartDiscout, userId)
                    discout = discout.discout
                }
                console.log(wallet)
                if (wallet >= total - discout) {
                    OrderID().then(async (id) => {
                        //walletAdd(userId, id, -total, 'Payment')
                        OrderPush(userId, id, total, 'Wallet').then(() => {
                            res.json({ response: "Wallet" })
                        })
                    })
                } else {
                    OrderID().then(async orderId => {
                        if (add.cartDiscout) {
                            let resp = await coupenCheck(add.cartDiscout, userId)
                            total = resp.subtotal
                        }
                        total = total - wallet

                        payment(total * 100, orderId).then((response) => {
                            response.wallet = wallet
                            res.json({ response: response })
                        })
                    })
                }
            } else {
                console.log('something went wrong at order controlleres')
            }
        }
    }
    catch (error) {
        next(error)
    }
}


exports.cancelOrder = async (req, res, next) => {
    try {
        let userId = req.session.user._id;
        let product = await orders_Model.aggregate([
            { $match: { 'OrderDetails._id': mongoose.Types.ObjectId(req.body.id) } },
            { $project: { "OrderDetails": { $filter: { input: "$OrderDetails", cond: { $eq: ["$$this._id", mongoose.Types.ObjectId(req.body.id)] } } } } }
        ])
        let total = product[0].OrderDetails[0].total
        let P_id = product[0].OrderDetails[0].product_id
        let P_qty = product[0].OrderDetails[0].quantity
        inventory(P_id, -P_qty)
        let C_date = moment(Date.now()).format('DD-MM-YYYY')
        let { OrderId, TotalPrice, coupenapplied, discountPercentage, discountPrice, Payment, finalPrice } = await orders_Model.findOne({ 'OrderDetails._id': req.body.id }, { _id: -1, OrderId: 1, TotalPrice: 1, coupenapplied: 1, discountPercentage: 1, discountPrice: 1, Payment: 1, finalPrice: 1 });
        let coptotal = TotalPrice
        TotalPrice = TotalPrice - total
        let finalPricee = TotalPrice
        if (coupenapplied) {
            let disc = percentage(discountPercentage, TotalPrice)
            if (disc < discountPrice) discountPrice = disc
            finalPricee = TotalPrice - discountPrice
            await orders_Model.updateOne({ 'OrderDetails._id': req.body.id }, { $set: { 'OrderDetails.$.Order_Status': 'Cancelled', 'OrderDetails.$.Canceled_date': C_date, finalPrice: finalPricee, discountPrice: disc }, $inc: { TotalPrice: -total } })
        } else {
            await orders_Model.updateOne({ 'OrderDetails._id': req.body.id }, { $set: { 'OrderDetails.$.Order_Status': 'Cancelled', 'OrderDetails.$.Canceled_date': C_date }, $inc: { TotalPrice: -total, finalPrice: -total } })
        }
        console.log(req.body.id)
        if (finalPricee === 0) {
            if (Payment !== "COD") walletAdd(userId, OrderId, finalPrice, "Refund")
            orders_Model.updateOne({ 'OrderDetails._id': req.body.id }, { $set: { Delivery_status: 'Cancelled', Delivery_Expected_date: C_date, TotalPrice: 0, finalPrice: 0, discountPrice: 0 } })
        } else {
            if (Payment !== "COD") walletAdd(userId, OrderId, total, "Refund")
        }
        res.json({ response: false, total: TotalPrice, date: C_date, finalPrice: finalPricee, discountPrice: discountPrice })
    }
    catch (error) {
        next(error)
    }
}

exports.coupenApply = (req, res, next) => {
    try {
        let userId = req.session.user._id;
        coupenCheck(req.body.code, userId).then((response) => {
            response.coupenStatus = true
            res.json(response)
        }).catch(response => {
            console.log(response)
            res.json({ coupenStatus: false, response: response })
        })
    }
    catch (error) {
        next(error)
    }
}
exports.coupenSave = async (req, res, next) => {
    try {
        let userId = req.session.user._id;
        if (req.body.code) {
            await usermodel.findByIdAndUpdate(userId, { $set: { cartDiscout: req.body.code } })
        } else {
            await usermodel.findByIdAndUpdate(userId, { $unset: { cartDiscout: 1 } }, { multi: true });
        }
        req.session.checkout = true
        res.json()
    } catch (error) {
        next(error)
    }
}
