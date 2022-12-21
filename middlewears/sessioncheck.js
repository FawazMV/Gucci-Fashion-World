const { findOne } = require("../models/coupen_schema")
const usermodel = require("../models/user-schema")

exports.sessionCheck = async (req, res, next) => {
    if (req.session.user) {
        if (await usermodel.findOne({ _id: req.session.user._id, isBanned: false })) next()
        else {
            req.session.user = false
            res.redirect('/login')
        }
    }
    else res.redirect('/login')
}

exports.sessionCheckAxios = async (req, res, next) => {
    if (req.session.user) {
        if (await usermodel.findOne({ _id: req.session.user._id, isBanned: false })) next()
        else {
            req.session.user = false
            res.json({ response: "login" })
        }
    }
    else res.json({ response: "login" })
}

exports.loginCheck = (req, res, next) => {
    if (req.session.user) res.redirect('/')
    else next()
}

exports.admincheck = (req, res, next) => {
    // if (req.session.admin) next()
    // else res.redirect('/admin/login')
    next()
}
exports.adminCheckAxios = async (req, res, next) => {
    // if (req.session.admin) next()
    // else res.json({ response: "login" })
    next()
}