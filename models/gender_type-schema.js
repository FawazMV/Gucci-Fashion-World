const mongoose = require('mongoose')

const gender_typeSchema = new mongoose.Schema({

    gender: {
        type: String,
        required: true,
        unique: true
    },
    discount: {
        type: Number,
        default: 0,
        max: 100,
        min: 0,
        required: true
    },
    image: {
        type: Array,
        required: true
    }
}

)

const genderModel = mongoose.model('Gender_Type', gender_typeSchema)
module.exports = genderModel