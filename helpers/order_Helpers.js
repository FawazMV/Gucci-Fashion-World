const { default: mongoose } = require("mongoose")
const ObjectId = require("objectid")
const coupn_Model = require("../models/coupen_schema")
const orders_Model = require("../models/order-schema")
const productModel = require("../models/product-schema")
const usermodel = require("../models/user-schema")
const wallet_model = require("../models/wallet-schema")

exports.subTotal = (user) => {
    return new Promise(async (resolve, reject) => {
        let result = await usermodel.findById(user, { cart: 1 }).populate({ path: 'cart.product_id', model: 'Products' })
        cartproduct = result.cart
        let total = await cartproduct.map(x => x.quantity * x.product_id.shopPrice).reduce((acc, curr) => {
            acc = acc + curr
            return acc
        }, 0)
        resolve(total)
    })
}

exports.OrderPush = (userId, orderId, total, payment) => {
    return new Promise(async (resolve, reject) => {
        let x = {};
        x.OrderId = orderId;
        OrderDetails = await usermodel.findById(userId, { _id: 0, cart: 1, cartDiscout: 1 })
        for (let i = 0; i < OrderDetails.cart.length; i++) {
            let id = OrderDetails.cart[i].product_id
            let qty = OrderDetails.cart[i].quantity
            await this.inventory(id, qty)
        }
        x.OrderDetails = OrderDetails.cart
        x.User = userId
        DeliverAddress = await usermodel.aggregate([
            { $match: { _id: mongoose.Types.ObjectId(userId) } },
            { $project: { "address": { $filter: { input: "$address", cond: { $eq: ["$$this.default", true] } } } } }
        ])
        x.DeliverAddress = DeliverAddress[0].address[0]
        x.TotalPrice = total;
        x.finalPrice = total;
        x.Payment = payment
        if (OrderDetails.cartDiscout) {
            x.coupenapplied = true
            let discountPercentage = await coupn_Model.findOne({ code: OrderDetails.cartDiscout }, { _id: 0, discount: 1 })
            x.discountPercentage = discountPercentage.discount
            x.cartDiscout = OrderDetails.cartDiscout
            await this.coupenCheck(OrderDetails.cartDiscout, userId).then(resp => {
                x.discountPrice = resp.discout
                x.finalPrice = resp.subtotal
            }).catch(err => {
                console.log(err)
            })
            await coupn_Model.findOneAndUpdate({ coupenCode: OrderDetails.cartDiscout }, { $push: { users: { user: userId } } })
        }
        orders_Model.create(x).then(() => {
            usermodel.findByIdAndUpdate(userId, { $set: { cart: [] } }).then((e) => {
                resolve()
            })
        }).catch((error) => {
            console.log(error.message)
            reject()
        })
    })

}

exports.inventory = (productId, qntity) => {
    return new Promise((resolve, reject) => {
        productModel.findByIdAndUpdate(productId, { $inc: { quantity: -qntity } }).then(() => {
            resolve()
        })
    })
}


exports.percentage = (pV, total) => {
    let per = (total * pV) / 100;
    return (Math.round(per))
}


exports.coupenCheck = (code, userId) => {
    return new Promise((resolve, reject) => {
        let response = null
        coupn_Model.findOne({ coupenCode: code, coupen_status: true }, { _id: 0, coupenCode: 0 }).then(async (coup) => {
            if (coup) {
                let { discount, starting_Date, Ending_Date, discount_limit } = coup
                const x = new Date(starting_Date);
                const y = new Date(Ending_Date);
                const now = new Date(Date.now());
                if (now >= x) {
                    if (now <= y) {
                        let user = await coupn_Model.findOne({ coupenCode: code, 'users.user': userId })
                        if (!user) {
                            let Discount = {}
                            this.subTotal(userId).then((Total) => {
                                let reduced = this.percentage(discount, Total)
                                if (reduced > discount_limit) reduced = discount_limit
                                Total = Total - reduced
                                Discount.subtotal = Total
                                Discount.discout = reduced
                                resolve(Discount)
                            })
                        } else response = "You are already used the coupen"
                    } else response = 'Coupen is expired'
                } else response = "The offer didin't started yet"
            } else response = "The coupen is not valid"
            if (response) reject(response)
        })

    })
}

exports.walletAdd = (user, order, total, type) => {
    return new Promise((resolve, reject) => {
        let obj = {}
        obj.order = order
        obj.amount = Math.abs(total)
        obj.type = type
        usermodel.updateOne({ _id: user }, { $push: { 'wallet.history': obj }, $inc: { 'wallet.balance': total } }).then((e) => {
            console.log(e)
            resolve()
        })
    })
}