const mongoose = require('mongoose')
var moment = require('moment');
const dateee = new Date();
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
                total: {
                    type: Number,
                    required: true
                },
                Order_Status: {
                    type: String,
                    default: "Pending"
                },
                Canceled_date: {
                    type: String
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
            default: moment(Date.now()).format('DD-MM-YYYY')
        },
        Delivery_Expected_date: {
            type: String,
            default: moment(dateee.setDate(dateee.getDate() + 7)).format('DD-MM-YYYY')

        },
        Out_for_delivery_date: {
            type: String
        },

        Payment: {
            type: String,
            required: true
        },
        Delivery_status: {
            type: String,
            default: "Pending"
        },
        Shipped_Date: {
            type: String
        },
        coupenapplied: {
            type: Boolean,
            default: false
        },
        cartDiscout: {
            type: String
        },
        finalPrice: {
            type: Number
        },
        discountPrice: {
            type: Number,
            default: 0
        },
        discountPercentage: {
            type: Number
        }

    },
    {
        timestamps: true
    } 
)

const orders_Model = mongoose.model('Orders', orders_Schema)
module.exports = orders_Model






