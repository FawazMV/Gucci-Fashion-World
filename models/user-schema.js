const mongoose = require('mongoose')

const userSchema = new mongoose.Schema
    (
        {
            name: {
                type: String,
                required: true,
                trim: true
            },
            email: {
                type: String,
                required: true,
                unique: true,
                trim: true
            },
            mobile: {
                type: String,
                required: true,
                trim: true
            },
            password: {
                type: String,
                required: true,
                trim: true,
                minlength: [6]
            },
            isBanned: {
                type: Boolean,
                default: false
            },
            cart: [
                {
                    product_id: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: 'Products',
                    },
                    quantity: {
                        type: Number,
                        default: 1
                    },
                    total: {
                        type: Number,
                        required: true
                    },
                }
            ],
            cartDiscout:{
                type:String
            },
            wishlist: [
                {
                    product_id: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: 'Products',
                    }
                }
            ],
            address: [
                {
                    default: {
                        type: Boolean,
                        default: false
                    },
                    firstname: {
                        type: String,
                        required: true
                    },
                    lastname: {
                        type: String,
                        required: true
                    },
                    address: {
                        type: String,
                        required: true
                    },
                    city: {
                        type: String,
                        required: true
                    },
                    state: {
                        type: String,
                        required: true
                    },
                    pincode: {
                        type: Number,
                        required: true
                    },
                    phone: {
                        type: Number,
                        required: true
                    }
                }
            ]
        },
        {
            timestamps: true
        }
    )

const usermodel = mongoose.model('users', userSchema)

module.exports = usermodel