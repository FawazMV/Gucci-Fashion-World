const { default: mongoose } = require("mongoose")
const { OrderID } = require("../config/orderId")
const { payment } = require("../config/payment")
const { subTotal, OrderPush } = require("../helpers/order_Helpers")
const orders_Model = require("../models/order-schema")
const usermodel = require("../models/user-schema")



exports.placeOrder = async (req, res) => {
    let userId = req.session.user._id
    let total = await subTotal(userId)
    if (req.body.payment === "online") {
        OrderID().then(orderId => {
            payment(total * 100, orderId).then((response) => res.json({ response: response }))
        })
    }
    else if (req.body.payment === "cod") {
        OrderID().then(async (id) => {
            res.json({ response: "cod" })
            OrderPush(userId, id, total)
        })
    } else {
        console.log('something went wrong at order controlleres')
    }
}

