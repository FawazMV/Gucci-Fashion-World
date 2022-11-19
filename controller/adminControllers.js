const bcrypt = require('bcrypt');
const usermodel = require("../models/user-schema")
const productModel = require('../models/product-schema')
const brandModel = require('../models/brandName-schema')
const adminModel = require('../models/admin-schema');
const genderModel = require('../models/gender_type-schema');
const { s3Uploadv2, s3Uploadv3, s3delte2, s3delte3 } = require('../config/s3Service')
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
        let users = await usermodel.find({})
        res.render('admin/userview', { admin: true, users, Clients: "active", heading: "Users" })
    },
    blockUser: async (req, res) => {
        await usermodel.findByIdAndUpdate(req.params.id, { isBanned: true }, { new: true })
        res.redirect('/admin/users')
    },
    unblockUser: async (req, res) => {
        await usermodel.findByIdAndUpdate(req.params.id, { isBanned: false }, { new: true })
        res.redirect('/admin/users')
    },
    productsView: async (req, res) => {
        let products = await productModel.find({ deleteProduct: false }).populate('brandName').populate('gender').lean()
        res.render('admin/products', { admin: true, products, Products: "active", heading: "Products" })
    },
    addProduct: async (req, res) => {
        let brandName = await brandModel.find({}).lean()
        let gender = await genderModel.find({}).lean()
        res.render('admin/addProduct', { admin: true, heading: "Add Product", brandName, gender, msg, add: "active" })
        msg = false
    },
    addProductPost: async (req, res) => {
        const results = await s3Uploadv3(req.files);
        let product = req.body
        product.imagesDetails = results
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
        brandName = req.body.brandName.toUpperCase()
        brandModel.create({ brandName: brandName }).then(() => {
            res.redirect('/admin/addBrandName')
        }).catch(error => {
            console.log(error)
            res.redirect('/admin/addBrandName')
        })
    },
    deleteBrandName: async (req, res) => {
        let id = req.body.id
        let response;
        let brand = await productModel.findOne({ brandName: id })
        if (brand) res.json({ response: false })
        else {
            brandModel.findByIdAndDelete(id).then(() => {
                res.json({ response: true })
            }).catch(error => console.log(error))
        }

    },
    EditBrandName: (req, res) => {
        let id = req.body.id
        let brandName = req.body.brandName.toUpperCase()
        brandModel.findByIdAndUpdate(req.body.id, { brandName: brandName }).then(() => {
            res.json({ response: true })
        }).catch(error => {
            console.log(error)
            res.json({ response: false })
        })
    }
    ,
    deleteProduct: async (req, res) => {
        await productModel.findByIdAndUpdate(req.params.id, { deleteProduct: true }, { new: true })
        res.redirect('/admin/Products')
    },
    editPage: async (req, res) => {
        product_id = req.params.id
        let gender = await genderModel.find({}).lean()
        product = await productModel.findById(product_id).populate('brandName').populate('gender').lean()
        let brandName = await brandModel.find({})
        res.render('admin/editProduct', { admin: true, heading: "Edit Product", brandName, product, gender })
    },
    updateProduct: async (req, res) => {
        let product = req.body
        if (req.files.length) {
            productModel.findById(product_id).then((product) => {
                const image = product.imagesDetails
                s3delte3(image)
            })
            const results = await s3Uploadv3(req.files);
            product.imagesDetails = results
        }
        productModel.findByIdAndUpdate(product_id, product).then(() => {
            res.redirect('/admin/Products')
        }).catch(error => {
            console.log(error)
            res.redirect('/admin/Products')
        })
    },
    genderType: async (req, res) => {
        let gender = await genderModel.find({})
        res.render('admin/gender', { admin: true, heading: "Gender Types", gender })
    },
    genderTypeAdd: async (req, res) => {
        let category = req.body
        const file = req.files[0];
        const result = await s3Uploadv2(file);
        category.image = result
        genderModel.create(category).then(() => {
            res.redirect('/admin/genderType')
        }).catch(error => {
            console.log(error)
            res.redirect('/admin/genderType')
        })
    },
    deleteGender: async (req, res) => {
        let id = req.body.id
        let response;
        let gender = await productModel.findOne({ gender: id })
        if (gender) res.json({ response: false })
        else {
            genderModel.findById(id).then((category) => {
                const image = category.image[0]
                s3delte2(image)
            }).then(() => {
                genderModel.findByIdAndDelete(id).then(() => {
                    res.json({ response: true })
                }).catch(error => {
                    console.log(error)
                    res.redirect('/admin/genderType')
                })
            })
        }

    },
    editGender: async (req, res) => {
        let category = { gender: req.body.gender }
        id = req.body.id
        if (req.files.length) {
            genderModel.findById(id).then((product) => {
                const image = product.image[0]
                s3delte2(image)
            })
            const file = req.files[0];
            const result = await s3Uploadv2(file);
            category.image = result
        }
        genderModel.findByIdAndUpdate(id, category).then(() => {
            res.redirect('/admin/genderType')
        }).catch(error => {
            console.log(error)
            res.redirect('/admin/genderType')
        })
    },
    single: (req, res) => {
        id = req.params.id
        productModel.findById(id).then((product) => {
            console.log(product)     
            res.render('admin/viewSingle', { admin: true, product })
        })
    }
} 