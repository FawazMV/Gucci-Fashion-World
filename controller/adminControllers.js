const bcrypt = require('bcrypt');
const usermodel = require("../models/user-schema")
const productModel = require('../models/product-schema')
const brandModel = require('../models/brandName-schema')
const adminModel = require('../models/admin-schema');
const genderModel = require('../models/gender_type-schema')
let msg, product_id
module.exports = {

    dashboard: (req, res) => {
        heading = "Overview"
        res.render('admin/dashboard', { admin: true, Overview: "active", heading })
    },
    adminlogin: (req, res) => {
        res.render('admin/adminlogin', { includes: true })
    },
    adminloginPost: async (req, res) => {
        let response = null
        let user = await adminModel.findOne({ email: req.body.email })
        if (user) {
            if (req.body.password == user.password) response = false
            else response = true
        } else response = true
        res.json({ response })
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
        let products = await productModel.find({ deleteProduct: false }).populate('brandName').populate('gender').lean()
        res.render('admin/products', { admin: true, products, Products: "active", heading: "Products" })
    },
    addProduct: async (req, res) => {
        let brandName = await brandModel.find({}).lean()
        let gender = await genderModel.find({}).lean()
        res.render('admin/addProduct', { admin: true, heading: "Add Product", brandName, gender, msg })
        msg = false
    },
    addProductPost: (req, res) => {
        let product = req.body
        product.imagesDetails = req.files
        productModel.create(product).then(() => {
            msg = true
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
    deleteBrandName:async(req,res)=>{
        let id =req.params.id
        let brand =await productModel.findOne({brandName:id})
        if(brand){

        }else{
            
        }
        console.log(brand)
    },
    deleteProduct: async (req, res) => {
        await productModel.findByIdAndUpdate(req.params.id, { deleteProduct: true }, { new: true })
        res.redirect('/admin/Products')
    },
    editPage: async (req, res) => {
        product_id = req.params.id
        let gender = await genderModel.find({}).lean()
        product = await productModel.findById(product_id).populate('brandName').populate('gender').lean()
        let brandName = await brandModel.find({})
        res.render('admin/editProduct', { admin: true, heading: "Edit Product", brandName, product,gender })
    },
    updateProduct: (req, res) => {
        let product = req.body
        if (req.files.length) product.imagesDetails = req.files
        console.log(product)
        productModel.findByIdAndUpdate(product_id, product).then(() => {
            res.redirect('/admin/Products')
        }).catch(error => console.log(error))
    },
    genderType: async (req,res)=>{
        let gender = await genderModel.find({})
        res.render('admin/gender', { admin: true, heading: "Gender Types", gender })
    },
    genderTypeAdd: (req, res) => {
        let category = req.body
        category.image = req.files
        genderModel.create(category).then(() => {
            res.redirect('/admin/genderType')
        }).catch(error => console.log(error))
    },
} 