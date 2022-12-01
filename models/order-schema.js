const mongoose = require('mongoose')

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
        OrderDetails: {
            type: Array,
            required: true
        },
        TotalPrice: {
            type: Number,
            required: true
        },

        DeliverAddress: {
            type: Object,
            required: true
        },
        Order_date: {
            type: Date,
            default: Date.now()
        },
        Delivery_date: {
            type: Date,
        },
        Order_Status: {
            type: Boolean,
            default: false
        },
        Payment:{
            type:Boolean,
            required:true
        }

    }
)

const orders_Model = mongoose.model('Orders', orders_Schema)
module.exports = orders_Model