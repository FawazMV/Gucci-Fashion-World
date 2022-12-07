const { default: mongoose } = require("mongoose")
const { OrderID } = require("../config/orderId")
const { payment } = require("../config/payment")
const { subTotal, OrderPush, inventory, percentage } = require("../helpers/order_Helpers")
const orders_Model = require("../models/order-schema")
const usermodel = require("../models/user-schema")
const moment = require('moment')
const coupn_Model = require("../models/coupen_schema")



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
            OrderPush(userId, id, total, 'COD')
        })
    } else {
        console.log('something went wrong at order controlleres')
    }
}


exports.cancelOrder = async (req, res) => {
    let userId = req.session.user._id;
    let product = await orders_Model.aggregate([
        { $match: { 'OrderDetails._id': mongoose.Types.ObjectId(req.body.id) } },
        {
            $project: {
                "OrderDetails": {
                    $filter: {
                        input: "$OrderDetails",
                        cond: { $eq: ["$$this._id", mongoose.Types.ObjectId(req.body.id)] }
                    }
                }
            }
        }
    ])
    let total = product[0].OrderDetails[0].total
    let P_id = product[0].OrderDetails[0].product_id
    let P_qty = product[0].OrderDetails[0].quantity
    inventory(P_id, -P_qty)
    let C_date = moment(Date.now()).format('DD-MM-YYYY')
    await orders_Model.updateOne({ 'OrderDetails._id': req.body.id }, { $set: { 'OrderDetails.$.Order_Status': 'Cancelled', 'OrderDetails.$.Canceled_date': C_date }, $inc: { TotalPrice: -total } })
    let { TotalPrice } = await orders_Model.findOne({ 'OrderDetails._id': req.body.id }, { _id: -1, TotalPrice: 1 })
    res.json({ response: false, total: TotalPrice, date: C_date })

}

exports.coupenApply = (req, res) => {
    let userId = req.session.user._id;
    console.log(req.body)
    coupn_Model.findOne({ coupenCode: req.body.code, coupen_status: true }).then(async (coup) => {
        if (coup) {
            let str_date = coup.starting_Date
            let end_date = coup.Ending_Date
            const x = new Date(str_date);
            const y = new Date(end_date);
            const now = new Date('2022-12-07');
            if (x >= now) {
                if (y <= now) {
                    let user = await coupn_Model.findOne({ coupenCode: req.body.code, 'users.user': userId })
                    if (!user) {
                        subTotal(userId).then((Total) => {
                            let disc = coup.discount
                            let discout = percentage(disc, Total)
                            let limit = coup.discount_limit
                            if (discout > limit) discout = limit
                            usermodel.findByIdAndUpdate(userId,{$set:{  }})
                        })


                    } else {
                        //you are already used the coupen
                    }
                } else {
                    //Your coupen is expired
                }
            } else {
                //the offer didin't started yet
            }

        } else {
            //coupen is not available
        }
    })

}

// const x = new Date('2013-05-23');
// const x = new Date('2013-05-23');
// console.log('+x === +y', +x === +y);
// console.log('x < y', x < y); // false
// console.log('x > y', x > y); // false
// console.log('x <= y', x <= y); // true
// console.log('x >= y', x >= y); // true
// console.log('x === y', x === y);