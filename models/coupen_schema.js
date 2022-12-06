const mongoose = require('mongoose')
var moment = require('moment');
const dateee = new Date();
const coupen_Schema = new mongoose.Schema(
    {
        coupenCode: {
            type: String,
            unique: true,
            trim: true,
            required: true
        },
        discount: {
            type: Number,
            required: true
        },

        starting_Date: {
            type: String,
            required: true
        },

        Ending_Date: {
            type: String,
            required: true
        },
        discount_limit: {
            type: Number,
            required: true
        },
        coupen_status: {
            type: Boolean,
            default: true
        },
        users: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Users'
                }

            }
        ]

    }
)

const coupn_Model = mongoose.model('Coupens', coupen_Schema)
module.exports = coupn_Model






