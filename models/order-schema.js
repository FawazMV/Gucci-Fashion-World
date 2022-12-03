const mongoose = require('mongoose')
var moment = require('moment');
const orders_Schema = new mongoose.Schema(
    {
        OrderId: {
            type: String,
            required: true
        },
        User: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true
        },
        OrderDetails: [
            {
                product_id: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Products"
                },
                quantity: {
                    type: Number,
                    required: true
                },
                Order_Status: {
                    type: String,
                    default: "Pending"
                },
            }
        ],
        TotalPrice: {
            type: Number,
            required: true
        },

        DeliverAddress: {
            type: Object,
            required: true
        },
        Order_date: {
            type: String,
            default: moment(Date.now()).format('YYYY-MM-DD')
        },
        Delivery_date: {
            type: Date,
        },

        Payment: {
            type: Boolean,
            required: true
        }

    }
)

const orders_Model = mongoose.model('Orders', orders_Schema)
module.exports = orders_Model

