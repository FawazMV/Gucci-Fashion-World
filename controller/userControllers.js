const bcrypt = require('bcrypt');
const usermodel = require('../models/user-schema');
const { accoutnSID, authToken, serviceSID } = require("../config/OTP")
const client = require("twilio")(accoutnSID, authToken);
let response, otpstatus,userNumber, userDetails
let resend = true

function otpcallin(number) {
    client.verify.services(serviceSID).verifications.create({
        to: `+91${number}`,
        channel: "sms",
    })
}


module.exports = {
    signup: (req, res) => {
        res.render('userSide/signup', { includes: true, response })
        response = null
    },
    login: (req, res) => {
        res.render('userSide/userlogin', { includes: true , response })
        response = null
    },
    home: (req, res) => {
        res.render('userSide/homepage', { admin: false })
    },
    loginPost:async (req, res) => {
        user = await usermodel.findOne({email:req.body.email})
       if (user){
           bcrypt.compare(req.body.password, user.password).then(status=>{
                if(status) res.redirect('/')
                else{
                    response = "Invalid password"
                    res.redirect('/login')
                }
           })
       }else{
        response = "Invalid email"
        res.redirect('/login')
       }
    },
    doSignup: async (req, res) => {
        const email = req.body.email
        userDetails = req.body
        userNumber = req.body.mobile
         
        if (await usermodel.findOne({ email: email })) {
            response = "Email id already exists"
            res.redirect('/signup')
        } else {
            otpcallin(req.body.mobile)
            res.redirect('/otp')
        }



    },
    otppage: (req, res) => {
        res.render('userSide/otp', { includes: true, userNumber, otpstatus,resend })
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
    OTPResend:(req,res)=>{
        otpcallin(userNumber)
        resend = false
        res.redirect('/otp')

    }
}