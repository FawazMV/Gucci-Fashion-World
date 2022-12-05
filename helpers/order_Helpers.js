const { default: mongoose } = require("mongoose")
const orders_Model = require("../models/order-schema")
const productModel = require("../models/product-schema")
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

exports.OrderPush = (userId, orderId, total, payment) => {
    return new Promise(async (resolve, reject) => {
        let x = {};
        x.OrderId = orderId;
        OrderDetails = await usermodel.findById(userId, { _id: -1, cart: 1 })
        console.log(OrderDetails)
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
        x.Payment = payment
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
        console.log(productId)
        productModel.findByIdAndUpdate(productId, { $inc: { quantity: -qntity } }).then(() => {
            resolve()
        })
    })
}
// exports.qntXprice = (id, qnt) => {
//     return new Promise(async (resolve, reject) => {
//         let product = await productModel.findById(id);
//         let total = product.shopPrice * qnt
//         resolve(total)
//     })
// }