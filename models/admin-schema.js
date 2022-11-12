const mongoose = require('mongoose')

const adminSchema = new mongoose.Schema
    (
        {
            
            email: {
                type: String,
                required: true,
                unique: true,
                trim: true
            },
            password: {
                type: String,
                required: true,
                trim: true,
                minlength: [6]
            }
            
        }
    )

const adminModel = mongoose.model('Admin', adminSchema)

module.exports = adminModel