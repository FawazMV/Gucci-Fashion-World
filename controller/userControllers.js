const bcrypt = require('bcrypt');
const usermodel = require('../models/user-schema');
let response;
module.exports = {
    signup: (req, res) => {
        res.render('userSide/signup', { includes: true, response })
        response = null
    },
    login: (req, res) => {
        res.render('userSide/userlogin', { includes: true })
    },
    home: (req, res) => {
        res.render('userSide/homepage', { admin: false })
    },
    loginPost: (req, res) => {
        res.redirect('/')
    },
    doSignup: async (req, res) => {
        console.log(req.body);
        const email = req.body.email
        userDetails = req.body
        userDetails.password = await bcrypt.hash(userDetails.password, 10)

        usermodel.create(userDetails).then(() => {
            res.redirect('/otp')
        }).catch(error => {
            console.log(error.code);
            if(error.code==11000){
                response = "Email id already exists"
                res.redirect('/signup')
            }
        })

    },
    otppage: (req, res) => {
        res.render('userSide/otp')
    }
}