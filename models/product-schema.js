const mongoose = require('mongoose')

const productSchema = new mongoose.Schema(
    {
        brandName: {
            type: mongoose.Schema.Types.ObjectId,
            ref:'brandName',
            required: true
        },
        retailPrice: {
            type: Number,
            required: true
        },
        shopPrice: {
            type: Number,
        },
        description: {
            type: String,
            required: true
        },
        color1: {
            type: String,
            required: true
        },
        color2: {
            type: String,
        },
        size: {
            type: String,
            required: true
        },
        gender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Gender_Type',
            required: true
        },
        category: { 
            type: String,
            required: true
        },
        type: {
            type: String,
            required: true
        },
        imagesDetails: {
            type:Array,
            required:true
        },
        quantity:{
            type:Number,
            required:true
        }, deleteProduct: {
            type: Boolean,
            default: false
        },
        review:{
            type:Number,
            default:0
        },
        rating:{
            type:Number,
            default:0
        }

    },
    {
        timestamps: true
    }
)

const productModel = mongoose.model('Products',productSchema)
module.exports = productModel