const OrderID = require("ordersid-generator")

exports.OrderID = () => {
    return new Promise((resove, reject)=> {
        let orderId = OrderID('short','HS')
        resove(orderId)
    })
}

