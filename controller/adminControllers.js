const usermodel = require("../models/user-schema")

module.exports = {

    dashboard: (req, res) => {
        Overview = "active"
        res.render('admin/dashboard', { admin: true, Overview })
    },
    adminlogin: (req, res) => {
        res.render('admin/adminlogin')
    },
    adminloginPost: (req, res) => {
        res.redirect('/admin')
    },
    userview: async (req, res) => {
        let users = await usermodel.find({ isBanned: false })
        texts = { btntext: "Block", heading: "Users", linktext: "BlockedUsers" }
        res.render('admin/userview', { admin: true, users, texts, Clients: "active" })
    },
    blockUser: async (req, res) => {
        await usermodel.findByIdAndUpdate(req.params.id, { isBanned: true }, { new: true })
        res.redirect('/admin/users')
    },
    viewBlockedUsers: async (req, res) => {
        let users = await usermodel.find({ isBanned: true })
        texts = { btntext: "Unblock", heading: "Blocked Users", linktext: "Users" }
        res.render('admin/userview', { admin: true, users, texts })

    },
    unblockUser: async (req, res) => {
        await usermodel.findByIdAndUpdate(req.params.id, { isBanned: false }, { new: true })
        res.redirect('/admin/blockedusers')
    },
    productsView: async (req, res) => {
        let products = await usermodel.find({ isBanned: false })
        res.render('admin/products', { admin: true, products, Products: "active" })
    }
} 