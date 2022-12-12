const bcrypt = require('bcrypt');
const { default: mongoose } = require("mongoose")
const usermodel = require("../models/user-schema")
const productModel = require('../models/product-schema')
const brandModel = require('../models/brandName-schema')
const adminModel = require('../models/admin-schema');
const genderModel = require('../models/gender_type-schema');
const { s3Uploadv2, s3Uploadv3, s3delte2, s3delte3 } = require('../config/s3Service');
const orders_Model = require('../models/order-schema');
const moment = require('moment');
const { inventory } = require('../helpers/order_Helpers');
const coupn_Model = require('../models/coupen_schema');
let msg, product_id;



module.exports = {

    dashboard: async (req, res) => {
        try {
            let users = await usermodel.find({}).count()
            const DaysAgo = new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000);
            const oldmonth = new Date(new Date().getTime() - 60 * 24 * 60 * 60 * 1000);
            console.log(moment(DaysAgo).format('DD-MM-YYYY'))
            let sales = 0
            let orders = 0
            let perfomance
            let saleReport = await orders_Model.aggregate([
                {
                    $match: { createdAt: { $gte: DaysAgo } },
                },
                {
                    $group: {
                        _id: { $dateToString: { format: "%m", date: "$createdAt" } },
                        totalPrice: { $sum: "$TotalPrice" },
                        count: { $sum: 1 },
                    },
                },
            ]);  
            console.log(saleReport)
            if (saleReport.length) {
                sales = saleReport[0].totalPrice      
                orders = saleReport[0].count
            }
            let previous = await orders_Model.aggregate([
                {
                    $match: { createdAt: { $lt: DaysAgo, $gte: oldmonth } },
                },
                {
                    $group: {
                        _id: { $dateToString: { format: "%m", date: "$createdAt" } },
                        totalPrice: { $sum: "$TotalPrice" },
                        count: { $sum: 1 },
                    },
                }, 
            ]);
            if (previous.length && saleReport.length) {
                let sum = (saleReport[0].totalPrice - previous[0].totalPrice) / 100
                perfomance = Math.round(sum)
            }
            console.log(orders)
            heading = "Overview"
            res.render('admin/dashboard', { admin: true, users, Overview: "active", heading, sales, orders, perfomance })
        } catch (error) {
            console.log(error)
        }
    },
    adminlogin: (req, res) => {
        try {
            res.render('admin/adminlogin', { includes: true })
        } catch (error) {
            console.log(error)
        }
    },
    adminloginPost: async (req, res) => {
        try {
            let response = null
            let user = await adminModel.findOne({ email: req.body.email })
            if (user) {
                if (req.body.password == user.password) response = false
                else response = true
            } else response = true
            res.json({ response })
        } catch (error) {
            console.log(error)
        }
    },
    userview: async (req, res) => {
        try {
            let users = await usermodel.find({})
            res.render('admin/userview', { admin: true, users, Clients: "active", heading: "Users" })
        } catch (error) {
            console.log(error)
        }
    }, salesReport: async (req, res) => {
        let saleReport = []
        const todayDate = new Date();
        const DaysAgo = new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000);
        saleReport = await orders_Model.aggregate([
            {
                $match: { createdAt: { $gte: DaysAgo } },
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%d-%m-%Y", date: "$createdAt" } },
                    totalPrice: { $sum: "$TotalPrice" },
                    count: { $sum: 1 },
                },
            },
        ]);
        res.render('admin/salesReport', { saleReport, admin: true,  heading: "Sales Report" })
    },
    blockUser: async (req, res) => {
        try {
            await usermodel.findByIdAndUpdate(req.params.id, { isBanned: true }, { new: true })
            res.redirect('/admin/users')
        } catch (error) {
            console.log(error)
        }
    },
    unblockUser: async (req, res) => {
        try {
            await usermodel.findByIdAndUpdate(req.params.id, { isBanned: false }, { new: true })
            res.redirect('/admin/users')
        } catch (error) {
            console.log(error)
        }
    },
    productsView: async (req, res) => {
        try {
            let products = await productModel.find({ deleteProduct: false }).populate('brandName').populate('gender').lean()
            res.render('admin/products', { admin: true, products, Products: "active", heading: "Products" })
        } catch (error) {
            console.log(error)
        }
    },
    addProduct: async (req, res) => {
        try {
            let brandName = await brandModel.find({}).lean()
            let gender = await genderModel.find({}).lean()
            res.render('admin/addProduct', { admin: true, heading: "Add Product", brandName, gender, msg, add: "active" })
            msg = false
        } catch (error) {
            console.log(error)
        }
    },
    addProductPost: async (req, res) => {
        try {
            // console.log(req.body)
            // console.log(req.files)
            const results = await s3Uploadv3(req.files);
            let product = req.body
            product.imagesDetails = results
            console.log(product)
            productModel.create(product).then(() => {
                res.json({ success: true })
            }).catch(error => console.log(error))
        } catch (error) {
            console.log(error)
        }
    },
    addBrandName: async (req, res) => {
        try {
            let brandName = await brandModel.find({})
            res.render('admin/BrandName', { admin: true, heading: "Brand Names", brandName })
        } catch (error) {
            console.log(error)
        }
    },
    BrandNameUpdate: (req, res) => {
        try {
            brandName = req.body.brandName.toUpperCase()
            brandModel.create({ brandName: brandName }).then(() => {
                res.redirect('/admin/addBrandName')
            }).catch(error => {
                console.log(error)
                res.redirect('/admin/addBrandName')
            })
        } catch (error) {
            console.log(error)
        }
    },
    deleteBrandName: async (req, res) => {
        try {
            let id = req.body.id
            let response;
            let brand = await productModel.findOne({ brandName: id })
            if (brand) res.json({ response: false })
            else {
                brandModel.findByIdAndDelete(id).then(() => {
                    res.json({ response: true })
                }).catch(error => console.log(error))
            }
        } catch (error) {
            console.log(error)
        }
    },
    EditBrandName: (req, res) => {
        try {
            let id = req.body.id
            let brandName = req.body.brandName.toUpperCase()
            brandModel.findByIdAndUpdate(req.body.id, { brandName: brandName }).then(() => {
                res.json({ response: true })
            }).catch(error => {
                console.log(error)
                res.json({ response: false })
            })
        } catch (error) {
            console.log(error)
        }
    }
    ,
    deleteProduct: async (req, res) => {
        try {
            await productModel.findByIdAndUpdate(req.params.id, { deleteProduct: true }, { new: true })
            res.redirect('/admin/Products')
        } catch (error) {
            console.log(error)
        }
    },
    editPage: async (req, res) => {
        try {
            product_id = req.params.id
            let gender = await genderModel.find({}).lean()
            product = await productModel.findById(product_id).populate('brandName').populate('gender').lean()
            let brandName = await brandModel.find({})
            res.render('admin/editProduct', { admin: true, heading: "Edit Product", brandName, product, gender })
        } catch (error) {
            console.log(error)
        }
    },
    updateProduct: async (req, res) => {
        try {
            let product = req.body
            console.log(product)
            console.log(req.files)
            if (req.files.length) {
                productModel.findById(product_id).then((product) => {
                    const image = product.imagesDetails
                    s3delte3(image)
                })
                const results = await s3Uploadv3(req.files);
                product.imagesDetails = results
            }
            productModel.findByIdAndUpdate(product_id, product).then(() => {
                res.json({ success: true })
            }).catch(error => {
                console.log(error)
                res.redirect('/admin/Products')
            })
        } catch (error) {
            console.log(error)
        }
    },
    genderType: async (req, res) => {
        try {
            let gender = await genderModel.find({})
            res.render('admin/gender', { admin: true, heading: "Gender Types", gender })
        } catch (error) {
            console.log(error)
        }
    },
    genderTypeAdd: async (req, res) => {
        try {
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
        } catch (error) {
            console.log(error)
        }
    },
    deleteGender: async (req, res) => {
        try {
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
        } catch (error) {
            console.log(error)
        }

    },
    editGender: async (req, res) => {
        try {
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
        } catch (error) {
            console.log(error)
        }
    },
    single: (req, res) => {
        try {
            id = req.params.id
            productModel.findById(id).populate('brandName').populate('gender').then((product) => {
                console.log(product)
                res.render('admin/viewSingle', { admin: true, product })
            })
        } catch (error) {
            console.log(error)
        }
    },
    orders: async (req, res) => {
        try {
            let order = await orders_Model.find().populate('User', "email").sort({ createdAt: -1 })
            let heading = 'Orders'
            res.render('admin/orders', { admin: true, Orders: "active", heading, order })
        } catch (error) {
            console.log(error)
        }
    },
    deliveryStatus: async (req, res) => {
        try {
            let status = req.body.value
            let date = moment(Date.now()).format('DD-MM-YYYY')
            if (status === "Shipped") {
                await orders_Model.findByIdAndUpdate(req.body.id, { $set: { Delivery_status: status, Shipped_Date: date } })
            }
            if (status === "Out_for_Delivery") {
                await orders_Model.findByIdAndUpdate(req.body.id, { $set: { Delivery_status: status, Out_for_delivery_date: date, Delivery_Expected_date: date } })
            }
            if (status === "Delivered") {
                await orders_Model.findByIdAndUpdate(req.body.id, { $set: { Delivery_status: status, Delivery_Expected_date: date } })
                await orders_Model.updateMany({ _id: req.body.id, "OrderDetails.Order_Status": 'Pending' },
                    { $set: { "OrderDetails.$[elem].Order_Status": 'Delivered' } },
                    { arrayFilters: [{ "elem.Order_Status": 'Pending' }], multi: true });
            }
            if (status === "Cancelled") {
                let OrderDetails = await orders_Model.aggregate([
                    { $match: { '_id': mongoose.Types.ObjectId(req.body.id) } },
                    {
                        $project: {
                            "OrderDetails": {
                                $filter: {
                                    input: "$OrderDetails",
                                    cond: { $eq: ["$$this.Order_Status", 'Pending'] }
                                }
                            }
                        }
                    }
                ])
                OrderDetails = OrderDetails[0].OrderDetails
                for (let i = 0; i < OrderDetails.length; i++) {
                    let id = OrderDetails[i].product_id
                    let qty = OrderDetails[i].quantity
                    await inventory(id, -qty)
                }
                let { coupenapplied, cartDiscout, User } = await orders_Model.findById(req.body.id, { coupenapplied: 1, cartDiscout: 1, User: 1, _id: 0 })
                if (coupenapplied) {
                    console.log(User)
                    await coupn_Model.updateOne({ coupenCode: cartDiscout }, { $pull: { users: { user: User } } }, { safe: true }).then(e => {
                        console.log(e)
                    })
                }
                await orders_Model.findByIdAndUpdate(req.body.id, { $set: { Delivery_status: status, Delivery_Expected_date: date, TotalPrice: 0, finalPrice: 0, discountPrice: 0, coupenapplied: false } })
                await orders_Model.updateMany({ _id: req.body.id }, { $set: { "OrderDetails.$[elem].Order_Status": 'Cancelled', 'OrderDetails.$[elem].Canceled_date': date } },
                    { arrayFilters: [{ "elem.Order_Status": 'Pending' }], multi: true });
            }
            res.json()
        } catch (error) {
            console.log(error)
        }
    },
    coupen: async (req, res) => {
        try {
            heading = "Coupens"
            let coupenss = []
            coupenss = await coupn_Model.find()
            res.render('admin/coupen', { admin: true, Coupens: "active", heading, coupenss })
        } catch (error) {
            console.log(error)
        }
    },
    addCoupen: (req, res) => {
        try {
            coupn_Model.create(req.body).then(() => res.json())
        } catch (error) {
            console.log(error)
        }
    },
    coupenStatus: (req, res) => {
        try {
            coupn_Model.findByIdAndUpdate(req.body.id, { $set: { coupen_status: req.body.value } })
                .then(() => res.json())
        } catch (error) {
            console.log(error)
        }
    },
    orderDetail: (req, res) => {
        try {
            console.log(req.query.id)
            orders_Model.findById(req.query.id).populate({ path: 'OrderDetails.product_id', model: 'Products', populate: { path: 'brandName', model: 'brandName' } }).populate('User', 'email')
                .then(orderDetail => {
                    console.log(orderDetail)
                    res.json(orderDetail)
                })
        } catch (error) {
            console.log(error)
        }
    },
    getDetails: async (req, res) => {
        try {
            let todayDate = new Date();
            let DaysAgo = new Date(new Date().getTime() - 1 * 24 * 60 * 60 * 1000);
            console.log(moment(DaysAgo).format('DD-MM-YYYY'))
            let sales = []
            for (let i = 1; i <= 7; i++) {
                let abc = {}
                let saleReport = await orders_Model.aggregate([
                    {
                        $match: { createdAt: { $lt: todayDate, $gte: DaysAgo } },
                    },
                    {
                        $group: {
                            _id: { $dateToString: { format: "%u", date: todayDate } },
                            totalPrice: { $sum: "$TotalPrice" },
                            count: { $sum: 1 },
                        },
                    },
                ]);
                if (saleReport.length) {
                    sales.push(saleReport[0])
                } else {
                    abc._id = todayDate.getDay() + 1
                    abc.totalPrice = 0
                    abc.count = 0
                    sales.push(abc)
                }
                todayDate = DaysAgo
                DaysAgo = new Date(new Date().getTime() - (i + 1) * 24 * 60 * 60 * 1000);

            }
            let prevsales = []
            console.log(moment(DaysAgo).format('DD-MM-YYYY'))
            for (let i = 1; i <= 7; i++) {
                let abc = {}
                let saleReport = await orders_Model.aggregate([
                    {
                        $match: { createdAt: { $lt: todayDate, $gte: DaysAgo } },
                    },
                    {
                        $group: {
                            _id: { $dateToString: { format: "%u", date: todayDate } },
                            totalPrice: { $sum: "$TotalPrice" },
                            count: { $sum: 1 },
                        },
                    },
                ]);
                if (saleReport.length) {
                    prevsales.push(saleReport[0])
                } else {
                    abc._id = todayDate.getDay() + 1
                    abc.totalPrice = 0
                    abc.count = 0
                    prevsales.push(abc)
                }
                todayDate = DaysAgo
                DaysAgo = new Date(new Date().getTime() - (i + 7) * 24 * 60 * 60 * 1000);
            }
            console.log(sales)
            console.log(prevsales)
            res.json({sales: sales, prevsales: prevsales})
        }
        catch (error) {
            console.log(error)
        }

    }
}                                         