const bcrypt = require('bcrypt');
const usermodel = require('../models/user-schema');
const accoutnSID = process.env.accoutnSID
const serviceSID = process.env.serviceSID
const authToken = process.env.authToken
const client = require("twilio")(accoutnSID, authToken);
let otpstatus, userNumber, userDetails
let resend = true

function otpcallin(number) {

    client.verify.services(serviceSID).verifications.create({
        to: `+91${number}`,
        channel: "sms",
    })
}


module.exports = {
    signup: (req, res) => {
        res.render('userSide/signup', { includes: true, responsee })
    },
    login: (req, res) => {
        res.render('userSide/userlogin', { includes: true })
    },
    home: (req, res) => {
        res.render('userSide/homepage', { admin: false })
    },
    loginPost: async (req, res) => {
        let response = null
        user = await usermodel.findOne({ email: req.body.email })
        if (user) {
            await bcrypt.compare(req.body.password, user.password).then(status => {
                if (status) response = false
                else response = "Invalid password"
            })
        } else response = "Invalid email"
        res.json({ response })
    },
    doSignup: async (req, res) => {
        let response = null
        const email = req.body.email
        userDetails = req.body
        userNumber = req.body.mobile

        if (await usermodel.findOne({ email: email })) {
            response = "Email id already exists"
        } else if (await usermodel.findOne({ mobile: userNumber })) {
            response = "Mobile number is already exists";
        }
        else {
            response = null
            otpcallin(userNumber)
            res.redirect('/otp')
        }
        res.json({ response })
    },
    otppage: (req, res) => {
        res.render('userSide/otp', { includes: true, userNumber, otpstatus, resend })
        otpstatus = false
    },
    otppageverify: (req, res) => {
        const { otp } = req.body;
        client.verify.v2.services(serviceSID)
            .verificationChecks
            .create({ to: `+91${userNumber}`, code: otp })
            .then(async response => {
                if (response.valid) {
                    userDetails.password = await bcrypt.hash(userDetails.password, 10)
                    usermodel.create(userDetails).then(() => {
                        res.redirect('/')
                    })
                } else {
                    otpstatus = true
                    res.redirect('/otp')
                }
            });
    },
    OTPResend: (req, res) => {
        otpcallin(userNumber)
        resend = false
        res.redirect('/otp')

    }
}