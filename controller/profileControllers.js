const { default: axios } = require("axios")
const { default: mongoose } = require("mongoose")
const { otpcallin, otpVeryfication } = require("../config/otp")
const usermodel = require("../models/user-schema")
const bcrypt = require('bcrypt');



exports.myAccount = (req, res, next) => {
    try {
        let user = req.session.user.name
        let userId = req.session.user._id
        usermodel.findById(userId, { name: 1, email: 1, mobile: 1, _id: 0, wallet: 1 }).then(async (userDetails) => {
            let address = [] = await usermodel.aggregate([
                { $match: { _id: mongoose.Types.ObjectId(userId) } },
                { $project: { _id: 0, "address": { $filter: { input: "$address", cond: { $eq: ["$$this.default", true] } } } } }
            ])
            address = address[0].address
            res.render('userSide/myAccount', { user, userDetails, address })
        }).catch(error => next(error))
    } catch (error) {
        next(error)
    }
}

exports.addAddress = (req, res, next) => {
    try {
        let userId = req.session.user._id
        let response = null
        usermodel.findByIdAndUpdate(userId, { $push: { address: req.body } }).then(() => {
            usermodel.findById(userId, { address: 1 }).then(result => {
                res.json({ response: false, address: result.address })
            })
        }).catch(error => res.json({ response: error.message }))
    } catch (error) {
        next(error)
    }
}
exports.getAddress = (req, res, next) => {
    try {
        let userId = req.session.user._id
        let response = null
        usermodel.aggregate([
            { $match: { _id: mongoose.Types.ObjectId(userId) } },
            {
                $project:
                    { _id: 0, address: { $sortArray: { input: "$address", sortBy: { default: -1 } } } }
            }
        ]).then(result => {
            if (result[0].address[0]) res.json({ response: false, address: result[0].address })
            else res.json({ response: "Please add your address" })
        }).catch(error => res.json({ response: error.message }))
    } catch (error) {
        next(error)
    }
}
exports.dafaultAddress = (req, res, next) => {
    try {
        let userId = req.session.user._id
        let address = null
        let response = null
        usermodel.updateOne({ _id: userId, 'address.default': true }, { $set: { 'address.$.default': false } }).then(() => {
            usermodel.updateOne({ _id: userId, 'address._id': req.body.id }, { $set: { 'address.$.default': true } }).then(() => {

                usermodel.aggregate([
                    { $match: { _id: mongoose.Types.ObjectId(userId) } },
                    { $project: { "address": { $filter: { input: "$address", cond: { $eq: ["$$this._id", mongoose.Types.ObjectId(req.body.id)] } } } } }
                ]).then((result) => {
                    res.json({ response: false, address: result[0] })
                })
            })
        }).catch(error => res.json({ response: error.message }))
    } catch (error) {
        next(error)
    }
}
exports.deleteAddress = (req, res, next) => {
    try {
        let userId = req.session.user._id
        usermodel.findByIdAndUpdate(userId, { $pull: { address: { _id: req.body.id } } }).then(() => {
            res.json({})
        })
    } catch (error) {
        next(error)
    }
}
exports.getEditAddress = (req, res, next) => {
    try {
        let userId = req.session.user._id
        usermodel.aggregate([
            { $match: { _id: mongoose.Types.ObjectId(userId) } },
            { $project: { "address": { $filter: { input: "$address", cond: { $eq: ["$$this._id", mongoose.Types.ObjectId(req.query.id)] } } } } }
        ]).then(result => {
            res.json({ address: result[0].address[0] })
        })
    } catch (error) {
        next(error)
    }
}
exports.updateAddress = (req, res, next) => {
    try {
        let userId = req.session.user._id
        usermodel.updateMany({ _id: mongoose.Types.ObjectId(userId), 'address._id': mongoose.Types.ObjectId(req.body.id) }, { $set: { 'address.$.firstname': req.body.firstname, 'address.$.lastname': req.body.lastname, 'address.$.address': req.body.address, 'address.$.city': req.body.city, 'address.$.state': req.body.state, 'address.$.pincode': req.body.pincode, 'address.$.phone': req.body.phone } }).then((() => {
            res.redirect('/checkout')
        }))
    } catch (error) {
        next(error)
    }
}

exports.mobileChange = async (req, res, next) => {
    try {
        let num = await usermodel.findOne({ mobile: req.body.mobile })
        if (num) res.json({ response: false })
        else {
            otpcallin(req.body.mobile)
            res.json({ response: true })
        }
    }
    catch (error) {
        next(error)
    }
}
exports.cofirmotp = (req, res, next) => {
    try {
        let userId = req.session.user._id
        let { otp, userNumber } = req.body
        console.log(otp, userNumber)
        otpVeryfication(otp, userNumber).then((result) => {
            console.log(result)
            if (result) {
                usermodel.findByIdAndUpdate(userId, { $set: { mobile: userNumber } }).then(() => {
                    res.json({ response: true })
                })
            } else res.json({ response: false })
        })
    }
    catch (error) {
        next(error)
    }
}

exports.updateProfile = async (req, res, next) => {
    try {
        const { name, email } = req.body
        let userId = req.session.user._id
        let userfind = await usermodel.findOne({ email: email })
        if (userfind) res.json({ response: false })
        else {
            usermodel.findByIdAndUpdate(userId, { $set: { name: name, email: email } }).then(() => {
                res.json({ response: true })
            })
        }
    }
    catch (error) {
        next(error)
    }
}
exports.passwordUpdate = async (req, res, next) => {
    try {
        let userId = req.session.user._id
        let { email, password } = await usermodel.findById(userId, { email: 1, password: 1 })
        let status = await bcrypt.compare(req.body.oldPassword, password)
        let user = await usermodel.findOne({ email: email }, { email: 1 })
        if (!user || user.email === req.body.email) {
            if (status) {
                let password = await bcrypt.hash(req.body.oldPassword, 10)
                await usermodel.findByIdAndUpdate(userId, { $set: { email: req.body.email, name: req.body.name, password: password } })
                res.json({ response: true })
            } else res.json({ response: false, reason: "Password is incorrect" })
        } else res.json({ response: false, reason: "Email id already exist" })

    }
    catch (error) {
        next(error)
    }
}   