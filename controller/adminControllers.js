const usermodel = require("../models/user-schema")
const productModel = require('../models/product-schema')
const brandModel = require('../models/brandName-schema')
module.exports = {

    dashboard: (req, res) => {
        heading = "Overview"
        res.render('admin/dashboard', { admin: true, Overview: "active", heading })
    },
    adminlogin: (req, res) => {
        res.render('admin/adminlogin')
    },
    adminloginPost: (req, res) => {
        res.redirect('/admin')
    },
    userview: async (req, res) => {
        let users = await usermodel.find({ isBanned: false })
        texts = { btntext: "Block", linktext: "BlockedUsers" }
        res.render('admin/userview', { admin: true, users, texts, Clients: "active", heading: "Users" })
    },
    blockUser: async (req, res) => {
        await usermodel.findByIdAndUpdate(req.params.id, { isBanned: true }, { new: true })
        res.redirect('/admin/users')
    },
    viewBlockedUsers: async (req, res) => {
        let users = await usermodel.find({ isBanned: true })
        texts = { btntext: "Unblock", linktext: "Users" }
        res.render('admin/userview', { admin: true, users, texts, heading: "Blocked Users", Clients: "active" })

    },
    unblockUser: async (req, res) => {
        await usermodel.findByIdAndUpdate(req.params.id, { isBanned: false }, { new: true })
        res.redirect('/admin/blockedusers')
    },
    productsView: async (req, res) => {
        let products = await productModel.find({ deleteProduct: false }).populate('brandName').lean()
        res.render('admin/products', { admin: true, products, Products: "active", heading: "Products" })
    },
    addProduct: async (req, res) => {
        let brandName = await brandModel.find({}).lean()
        res.render('admin/addProduct', { admin: true, heading: "Add Product", brandName })
    },
    addProductPost: (req, res) => {
        let product = req.body
        product.imagesDetails = req.files
        productModel.create(product).then(() => {
            res.redirect('/admin/addProduct')
        }).catch(error => console.log(error))
    },
    addBrandName: async (req, res) => {
        let brandName = await brandModel.find({})
        res.render('admin/BrandName', { admin: true, heading: "Brand Names", brandName })
    },
    BrandNameUpdate: (req, res) => {
        brandModel.create(req.body).then(() => {
            res.redirect('/admin/addBrandName')
        }).catch(error => {
            console.log(error)
            res.redirect('/admin/addBrandName')
        })
    },
    deleteProduct: async (req, res) => {
        await productModel.findByIdAndUpdate(req.params.id, { deleteProduct: true }, { new: true })
        res.redirect('/admin/Products')
    }
} 