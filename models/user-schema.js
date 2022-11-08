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
            }
        },
        {
            timestamps: true
        }
    )

const usermodel = mongoose.model('users',userSchema)

module.exports = usermodel