const { default: mongoose } = require("mongoose")
const orders_Model = require("../models/order-schema")
const usermodel = require("../models/user-schema")

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

exports.OrderPush = (userId, orderId, total) => {
    return new Promise(async (resolve, reject) => {
        let x = {};
        x.OrderId = orderId;
        OrderDetails = await usermodel.findById(userId, { _id: -1, cart: 1 })
        x.OrderDetails = OrderDetails.cart
        x.User = userId
        DeliverAddress = await usermodel.aggregate([
            { $match: { _id: mongoose.Types.ObjectId(userId) } },
            { $project: { "address": { $filter: { input: "$address", cond: { $eq: ["$$this.default", true] } } } } }
        ])
        x.DeliverAddress = DeliverAddress[0].address[0]
        x.TotalPrice = total;
        x.Payment = false
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