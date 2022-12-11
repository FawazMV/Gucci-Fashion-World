const { otpcallin, otpVeryfication } = require("../config/otp")
const usermodel = require("../models/user-schema")

exports.mobileChange = async (req, res) => {
    console.log('helo')
    let num = await usermodel.findOne({ mobile: req.body.mobile })
    if (num) res.json({ response: false })
    else {
        otpcallin(req.body.mobile)
        res.json({ response: true })
    }
}
exports.cofirmotp = (req, res) => {
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

exports.updateProfile = async (req, res) => {
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