const orders_Model = require("../models/order-schema")
const moment = require('moment');

exports.salesReportFunction = (start, end, id) => {
    return new Promise(async (resolve, reject) => {
        let saleReport = await orders_Model.aggregate([
            { $match: { createdAt: { $gte: start, $lt: end } } },
            {
                $group: {
                    _id: id,
                    totalPrice: { $sum: "$TotalPrice" },
                    count: { $sum: 1 }
                },
            }]).catch(error => reject(error))
        resolve(saleReport)
    })
}

exports.salefullFunction = (date, id) => {
    return new Promise(async (resolve, reject) => {
        let saleFull = await orders_Model.aggregate([
            { $match: { createdAt: { $gte: date } } },
            {
                $group: {
                    _id: id,
                    totalPrice: { $sum: "$TotalPrice" },
                    count: { $sum: 1 },
                }
            }]).catch(error => reject(error))
        resolve(saleFull)
    })
}