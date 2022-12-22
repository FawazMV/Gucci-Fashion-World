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
const { inventory, walletAdd } = require('../helpers/order_Helpers');
const coupn_Model = require('../models/coupen_schema');
const { OfferPrice } = require('../helpers/product_helper');
const { salesReportFunction, salefullFunction } = require('../helpers/admin_helpers');
let msg, product_id;



module.exports = {

    dashboard: async (req, res, next) => {
        try {
            let users = await usermodel.find({}).count().catch((error) => next(error))
            heading = "Overview"
            res.render('admin/dashboard', { admin: true, users, Overview: "active", heading })
        } catch (error) {
            next(error)
        }
    },
    adminlogin: (req, res, next) => {
        try {
            if (req.session.admin) res.redirect('/admin')
            else res.render('admin/adminlogin', { includes: true })
        } catch (error) {
            next(error)
        }
    },
    adminloginPost: async (req, res, next) => {
        try {
            let response = null
            let user = await adminModel.findOne({ email: req.body.email }).catch((error) => next(error))
            if (user) {
                if (req.body.password == user.password) {
                    req.session.admin = true
                    response = false
                }
                else response = true
            } else response = true
            res.json({ response })
        } catch (error) {
            next(error)
        }
    },
    adminlogout: (req, res, next) => {
        try {
            req.session.admin = false
            res.redirect('/admin/login')
        } catch (error) {
            next(error)
        }
    },
    userview: async (req, res, next) => {
        try {
            let users = await usermodel.find({}).catch((error) => next(error))
            res.render('admin/userview', { admin: true, users, Clients: "active", heading: "Users" })
        } catch (error) {
            next(error)
        }
    }, salesReport: async (req, res, next) => {
        let saleReport = []
        let todayDate = new Date();
        let DaysAgo = new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000);
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
            }, {
                $sort: { _id: 1 }
            }
        ]).catch((error) => next(error))
        todayDate = moment(todayDate).format('YYYY-MM-DD')
        DaysAgo = moment(DaysAgo).format('YYYY-MM-DD')
        res.render('admin/salesReport', { saleReport, admin: true, heading: "Sales Report", todayDate, DaysAgo })
    },
    blockUser: async (req, res, next) => {
        try {
            await usermodel.findByIdAndUpdate(req.params.id, { isBanned: true }, { new: true }).catch((error) => next(error))
            res.redirect('/admin/users')
        } catch (error) {
            next(error)
        }
    },
    unblockUser: async (req, res, next) => {
        try {
            await usermodel.findByIdAndUpdate(req.params.id, { isBanned: false }, { new: true }).catch((error) => next(error))
            res.redirect('/admin/users')
        } catch (error) {
            next(error)
        }
    },
    productsView: async (req, res, next) => {
        try {
            let products = await productModel.find({ deleteProduct: false }).populate('brandName').populate('gender').lean().catch((error) => next(error))
            res.render('admin/products', { admin: true, products, Products: "active", heading: "Products" })
        } catch (error) {
            next(error)
        }
    },
    addProduct: async (req, res, next) => {
        try {
            let brandName = await brandModel.find({}).lean().catch((error) => next(error))
            let gender = await genderModel.find({}).lean().catch((error) => next(error))
            res.render('admin/addProduct', { admin: true, heading: "Add Product", brandName, gender, msg, add: "active" })
            msg = false
        } catch (error) {
            next(error)
        }
    },
    addProductPost: async (req, res, next) => {
        try {
            const results = await s3Uploadv3(req.files);
            let product = req.body
            product.imagesDetails = results
            let { discount } = await genderModel.findById(product.gender, { _id: 0, discount: 1 }).catch((error) => next(error))
            if (product.discount > discount) discount = product.discount
            product.shopPrice = OfferPrice(discount, product.retailPrice)
            productModel.create(product).then(() => {
                res.json({ success: true })
            }).catch(error => next(error))
        } catch (error) {
            next(error)
        }
    },
    addBrandName: async (req, res, next) => {
        try {
            let brandName = await brandModel.find({}).catch((error) => next(error))
            res.render('admin/BrandName', { admin: true, heading: "Brand Names", brandName })
        } catch (error) {
            next(error)
        }
    },
    BrandNameUpdate: (req, res, next) => {
        try {
            brandName = req.body.brandName.toUpperCase()
            brandModel.create({ brandName: brandName }).then(() => {
                res.json()
            }).catch(error => {
                next(error)
                //res.redirect('/admin/addBrandName')
            })
        } catch (error) {
            next(error)
        }
    },
    deleteBrandName: async (req, res, next) => {
        try {
            let id = req.body.id
            let response;
            let brand = await productModel.findOne({ brandName: id }).catch((error) => next(error))
            if (brand) res.json({ response: false })
            else {
                brandModel.findByIdAndDelete(id).then(() => {
                    res.json({ response: true })
                }).catch(error => next(error))
            }
        } catch (error) {
            next(error)
        }
    },
    EditBrandName: (req, res, next) => {
        try {
            let id = req.body.id
            let brandName = req.body.brandName.toUpperCase()
            brandModel.findByIdAndUpdate(req.body.id, { brandName: brandName }).then(() => {
                res.json({ response: true })
            }).catch(error => next(error))
        } catch (error) {
            next(error)
        }
    }
    ,
    deleteProduct: async (req, res, next) => {
        try {
            await productModel.findByIdAndUpdate(req.params.id, { deleteProduct: true }, { new: true }).catch((error) => next(error))
            res.redirect('/admin/Products')
        } catch (error) {
            next(error)
        }
    },
    editPage: async (req, res, next) => {
        try {
            product_id = req.params.id
            let gender = await genderModel.find({}).lean().catch((error) => next(error))
            product = await productModel.findById(product_id).populate('brandName').populate('gender').lean()
            let brandName = await brandModel.find({}).catch((error) => next(error))
            res.render('admin/editProduct', { admin: true, heading: "Edit Product", brandName, product, gender })
        } catch (error) {
            next(error)
        }
    },
    updateProduct: async (req, res, next) => {
        try {
            let product = req.body
            if (req.files.length) {
                await productModel.findById(product_id).then((product) => {
                    const image = product.imagesDetails
                    s3delte3(image)
                }).catch((error) => next(error))
                const results = await s3Uploadv3(req.files);
                product.imagesDetails = results
            }
            let { discount } = await genderModel.findById(product.gender, { _id: 0, discount: 1 })
            if (product.discount > discount) discount = product.discount
            product.shopPrice = OfferPrice(discount, product.retailPrice)
            productModel.findByIdAndUpdate(product_id, product).then(() => {
                res.json({ success: true })
            }).catch(error => {
                next(error)
                res.redirect('/admin/Products')
            })
        } catch (error) {
            next(error)
        }
    },
    genderType: async (req, res, next) => {
        try {
            let gender = await genderModel.find({}).catch((error) => next(error))
            res.render('admin/gender', { admin: true, heading: "Gender Types", gender })
        } catch (error) {
            next(error)
        }
    },
    genderTypeAdd: async (req, res, next) => {
        try {
            let category = req.body
            category.gender = req.body.gender.toUpperCase()
            const file = req.files[0];
            const result = await s3Uploadv2(file);
            category.image = result
            category.discount = req.body.discount
            genderModel.create(category).then(() => {
                res.json({ succe: true })
            }).catch(error => next(error))
        } catch (error) {
            next(error)
        }
    },
    deleteGender: async (req, res, next) => {
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
                        next(error)
                    })
                })
            }
        } catch (error) {
            next(error)
        }

    },
    editGender: async (req, res, next) => {
        try {
            let gender = req.body.gender.toUpperCase()
            let category = { gender: gender }
            id = req.body.id
            if (req.files.length) {
                await genderModel.findById(id).then((product) => {
                    const image = product.image[0]
                    s3delte2(image)
                }).catch((error) => next(error))
                const file = req.files[0];
                const result = await s3Uploadv2(file);
                category.image = result
            }
            category.discount = req.body.discount
            let disc = req.body.discount
            await productModel.updateMany(
                { gender: id, discount: { $lt: disc } },
                [{ "$set": { "shopPrice": { $round: [{ $sum: [{ $divide: [{ $multiply: ["$retailPrice", -disc] }, 100] }, "$retailPrice"] }, 0] } } }]
            ).catch((error) => next(error))
            await productModel.updateMany(
                { gender: id, discount: { $gte: disc } },
                [{ "$set": { "shopPrice": { $round: [{ $subtract: ["$retailPrice", { $divide: [{ $multiply: ["$retailPrice", '$discount'] }, 100] }] }, 0] } } }]
            ).catch(error => next(error))
            genderModel.findByIdAndUpdate(id, category).then(() => {
                res.json({ succe: true })
            }).catch(error => next(error))
        } catch (error) {
            next(error)
        }
    },
    single: (req, res, next) => {
        try {
            id = req.params.id
            productModel.findById(id).populate('brandName').populate('gender').then((product) => {
                res.render('admin/viewSingle', { admin: true, product })
            }).catch((error) => next(error))
        } catch (error) {
            next(error)
        }
    },
    orders: async (req, res, next) => {
        try {
            let order = await orders_Model.find().populate('User', "email").sort({ createdAt: -1 }).catch((error) => next(error))
            let heading = 'Orders'
            res.render('admin/orders', { admin: true, Orders: "active", heading, order })
        } catch (error) {
            next(error)
        }
    },
    deliveryStatus: async (req, res, next) => {
        try {
            let status = req.body.value
            let date = moment(Date.now()).format('DD-MM-YYYY')
            if (status === "Shipped") {
                await orders_Model.findByIdAndUpdate(req.body.id, { $set: { Delivery_status: status, Shipped_Date: date } }).catch((error) => next(error))
            }
            if (status === "Out_for_Delivery") {
                await orders_Model.findByIdAndUpdate(req.body.id, { $set: { Delivery_status: status, Out_for_delivery_date: date, Delivery_Expected_date: date } }).catch((error) => next(error))
            }
            if (status === "Delivered") {
                await orders_Model.findByIdAndUpdate(req.body.id, { $set: { Delivery_status: status, Delivery_Expected_date: date } }).catch((error) => next(error))
                await orders_Model.updateMany({ _id: req.body.id, "OrderDetails.Order_Status": 'Pending' },
                    { $set: { "OrderDetails.$[elem].Order_Status": 'Delivered' } },
                    { arrayFilters: [{ "elem.Order_Status": 'Pending' }], multi: true }).catch((error) => next(error))
            }
            if (status === "Cancelled") {
                let OrderDetails = await orders_Model.aggregate([
                    { $match: { '_id': mongoose.Types.ObjectId(req.body.id) } },
                    {
                        $project: {
                            finalPrice: 1,
                            OrderId: 1,
                            Payment: 1,
                            "OrderDetails": {
                                $filter: {
                                    input: "$OrderDetails",
                                    cond: { $eq: ["$$this.Order_Status", 'Pending'] }
                                }
                            }
                        }
                    }
                ]).catch((error) => next(error))
                let FinalPrice = OrderDetails[0].finalPrice
                let OrderId = OrderDetails[0].OrderId
                let Payment = OrderDetails[0].Payment
                OrderDetails = OrderDetails[0].OrderDetails
                for (let i = 0; i < OrderDetails.length; i++) {
                    let id = OrderDetails[i].product_id
                    let qty = OrderDetails[i].quantity
                    await inventory(id, -qty).catch((error) => next(error))
                }
                let { coupenapplied, cartDiscout, User } = await orders_Model.findById(req.body.id, { coupenapplied: 1, cartDiscout: 1, User: 1, _id: 0 }).catch((error) => next(error))
                if (coupenapplied) {
                    await coupn_Model.updateOne({ coupenCode: cartDiscout }, { $pull: { users: { user: User } } }, { safe: true }).then(e => {
                    }).catch((error) => next(error))
                }
                if (Payment !== "COD" && FinalPrice) walletAdd(User, OrderId, FinalPrice, "Refund")
                await orders_Model.findByIdAndUpdate(req.body.id, { $set: { Delivery_status: status, Delivery_Expected_date: date, TotalPrice: 0, finalPrice: 0, discountPrice: 0, coupenapplied: false } }).catch((error) => next(error))
                await orders_Model.updateMany({ _id: req.body.id }, { $set: { "OrderDetails.$[elem].Order_Status": 'Cancelled', 'OrderDetails.$[elem].Canceled_date': date } },
                    { arrayFilters: [{ "elem.Order_Status": 'Pending' }], multi: true }).catch((error) => next(error))
            }
            res.json()
        } catch (error) {
            next(error)
        }
    },
    coupen: async (req, res, next) => {
        try {
            heading = "Coupens"
            let coupenss = []
            coupenss = await coupn_Model.find().catch((error) => next(error))
            res.render('admin/coupen', { admin: true, Coupens: "active", heading, coupenss })
        } catch (error) {
            next(error)
        }
    },
    addCoupen: (req, res, next) => {
        try {
            coupn_Model.create(req.body).then(() => res.json({ succ: true })).catch((error) => next(error))
        } catch (error) {
            next(error)
        }
    },
    coupenStatus: (req, res, next) => {
        try {
            coupn_Model.findByIdAndUpdate(req.body.id, { $set: { coupen_status: req.body.value } })
                .then(() => res.json()).catch((error) => next(error))
        } catch (error) {
            next(error)
        }
    },
    orderDetail: (req, res, next) => {
        try {
            orders_Model.findById(req.query.id).populate({ path: 'OrderDetails.product_id', model: 'Products', populate: { path: 'brandName', model: 'brandName' } }).populate('User', 'email')
                .then(orderDetail => {
                    res.json(orderDetail)
                }).catch((error) => next(error))
        } catch (error) {
            next(error)
        }
    },
    getDetails: async (req, res, next) => {
        try {
            let value = req.query.value
            var date = new Date(), y = date.getFullYear(), m = date.getMonth();
            var firstDay = new Date(y, m, 1);
            firstDay = new Date(firstDay.getTime() + 1 * 24 * 60 * 60 * 1000)
            let secondDate = new Date(firstDay.getTime() + 7 * 24 * 60 * 60 * 1000);
            let sales = []
            if (value == 30) {
                let perfomance
                let saleFull = await salefullFunction(firstDay, { $dateToString: { format: "%m", date: "$createdAt" } })
                    .catch((error) => next(error))
                let users = await usermodel.find({ createdAt: { $gt: firstDay } }).count().catch((error) => next(error))
                for (let i = 1; i <= 5; i++) {
                    let abc = {}
                    let saleReport = await salesReportFunction(firstDay, secondDate, moment(firstDay).format('DD - MM - YYYY'))
                        .catch((error) => next(error))
                    if (saleReport.length) sales.push(saleReport[0])
                    else {
                        abc._id = moment(firstDay).format('DD-MM-YYYY')
                        abc.totalPrice = 0
                        abc.count = 0
                        sales.push(abc)
                    }
                    firstDay = secondDate
                    if (i == 4) {
                        secondDate = new Date(firstDay.getFullYear(), firstDay.getMonth() + 1, 1)
                    } else {
                        secondDate = new Date(firstDay.getFullYear(), firstDay.getMonth() + 0, (i + 1) * 7)
                    }
                }
                firstDay = new Date(date.getFullYear(), date.getMonth() - 1, 1)
                let lastDate = new Date(date.getFullYear(), date.getMonth(), 0)
                secondDate = new Date(firstDay.getTime() + 7 * 24 * 60 * 60 * 1000);
                let PrevFull = await orders_Model.aggregate([
                    {
                        $match: { createdAt: { $gte: firstDay, $lt: lastDate } },
                    },
                    {
                        $group: {
                            _id: { $dateToString: { format: "%m", date: "$createdAt" } },
                            totalPrice: { $sum: "$TotalPrice" },
                            count: { $sum: 1 },
                        },
                    },
                ]).catch((error) => next(error))
                let prevsales = []
                for (let i = 1; i <= 5; i++) {
                    let abc = {}
                    let saleReport = await salesReportFunction(firstDay, secondDate, moment(firstDay).format('DD - MM - YYYY')).catch((error) => next(error))
                    if (saleReport.length) prevsales.push(saleReport[0])
                    else {
                        abc._id = moment(firstDay).format('DD-MM-YYYY')
                        abc.totalPrice = 0
                        abc.count = 0
                        prevsales.push(abc)
                    }
                    firstDay = secondDate
                    if (i == 4) {
                        secondDate = new Date(firstDay.getFullYear(), firstDay.getMonth() + 1, 1)
                    } else {
                        secondDate = new Date(firstDay.getFullYear(), firstDay.getMonth() + 0, (i + 1) * 7)
                    }
                }
                if (saleFull.length && PrevFull.length) {
                    let sum = (saleFull[0].totalPrice - PrevFull[0].totalPrice) / 100
                    perfomance = Math.round(sum)
                } else if (PrevFull.length) perfomance = -100
                res.json({ sales: sales, prevsales: prevsales, saleFull, perfomance, users })
            } else if (value == 365) {
                let perfomance
                y = date.getFullYear()
                var firstDay = new Date(y, 0, 1);
                let saleFull = await salefullFunction(firstDay, moment(firstDay).format('YYYY')).catch((error) => next(error))
                let users = await usermodel.find({ createdAt: { $gt: firstDay } }).count()
                let saleReport = await orders_Model.aggregate([
                    {
                        $match: { createdAt: { $gte: firstDay } },
                    },
                    {
                        $group: {
                            _id: { $dateToString: { format: "%m", date: "$createdAt" } },
                            totalPrice: { $sum: "$TotalPrice" },
                            count: { $sum: 1 },
                        },
                    }, { $sort: { _id: 1 } }
                ]).catch((error) => next(error))
                let sales = []
                for (let i = 1; i <= 12; i++) {
                    let aaa = true
                    for (let k = 0; k < saleReport.length; k++) {
                        aaa = false
                        if (saleReport[k]._id == i) {
                            sales.push(saleReport[k])
                            break;
                        } else aaa = true;
                    }
                    if (aaa) sales.push({ _id: i, totalPrice: 0, count: 0 })
                }
                firstDay = new Date(y - 1, 0, 1);
                let lastDay = new Date(y, 0, 0);
                let PrevFull = await salesReportFunction(firstDay, lastDay, moment(firstDay).format('YYYY'))
                    .catch((error) => next(error))
                let PreveReport = await orders_Model.aggregate([
                    { $match: { createdAt: { $gte: firstDay, $lt: lastDay } } },
                    {
                        $group: {
                            _id: { $dateToString: { format: "%m", date: "$createdAt" } },
                            totalPrice: { $sum: "$TotalPrice" },
                            count: { $sum: 1 },
                        },
                    }, { $sort: { _id: 1 } }
                ]).catch((error) => next(error))
                let prevsales = []
                for (let i = 1; i <= 12; i++) {
                    let aaa = true
                    for (let k = 0; k < PreveReport.length; k++) {
                        aaa = false
                        if (PreveReport[k]._id == i) {
                            prevsales.push(PreveReport[k])
                            break;
                        } else aaa = true;
                    }
                    if (aaa) prevsales.push({ _id: i, totalPrice: 0, count: 0 })
                }
                if (saleFull.length && PrevFull.length) {
                    let sum = (saleFull[0].totalPrice - PrevFull[0].totalPrice) / 100
                    perfomance = Math.round(sum)
                } else if (PrevFull.length) perfomance = -100
                res.json({ saleFull, sales, prevsales, perfomance, users })
            }
            else if (value == 7) {
                let todayDate = new Date();
                todayDate = new Date(todayDate.getTime() + 1 * 24 * 60 * 60 * 1000)
                let DaysAgo = new Date(todayDate.getTime() - 1 * 24 * 60 * 60 * 1000);
                let perfomance
                let sales = []
                for (let i = 1; i <= 7; i++) {
                    let abc = {}
                    let saleReport = await salesReportFunction(DaysAgo, todayDate, { $dateToString: { format: "%u", date: todayDate } }).catch((error) => next(error))
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
                let weekPrev = todayDate
                let users = await usermodel.find({ createdAt: { $gt: weekPrev } }).count()
                let saleFull = await salefullFunction(weekPrev, 1)
                let prevsales = []
                for (let i = 1; i <= 7; i++) {
                    let abc = {}
                    let saleReport = await salesReportFunction(DaysAgo, todayDate, { $dateToString: { format: "%u", date: todayDate } })
                        .catch((error) => next(error))
                    if (saleReport.length) prevsales.push(saleReport[0])
                    else {
                        abc._id = todayDate.getDay() + 1
                        abc.totalPrice = 0
                        abc.count = 0
                        prevsales.push(abc)
                    }
                    todayDate = DaysAgo
                    DaysAgo = new Date(new Date().getTime() - (i + 7) * 24 * 60 * 60 * 1000);
                }
                let PrevFull = await salesReportFunction(DaysAgo, todayDate, { $dateToString: { format: "%m", date: "$createdAt" } })
                    .catch((error) => next(error))
                if (saleFull.length && PrevFull.length) {
                    let sum = (saleFull[0].totalPrice - PrevFull[0].totalPrice) / 100
                    perfomance = Math.round(sum)
                } else if (PrevFull.length) perfomance = -100
                res.json({ sales: sales, prevsales: prevsales, saleFull, perfomance, users })
            }
        }
        catch (error) {
            next(error)
        }
    },
    salesProject: async (req, res, next) => {
        try {
            let start = new Date(req.query.from)
            let end = new Date(req.query.to)
            let filter = req.query.filter
            let abc = { $dateToString: { format: filter, date: "$createdAt" } }
            saleReport = await orders_Model.aggregate([
                { $match: { createdAt: { $gte: start, $lte: end } } },
                {
                    $group: {
                        _id: abc,
                        totalPrice: { $sum: "$TotalPrice" },
                        count: { $sum: 1 },
                    },
                }, { $sort: { _id: 1 } }
            ]).catch((error) => next(error))
            res.json({ saleReport: saleReport })
        } catch (error) {
            next(error)
        }
    }
}

