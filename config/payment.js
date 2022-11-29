const Razorpay = require('razorpay');
const crypto = require('crypto')

var instance = new Razorpay({
    key_id: process.env.key_id,
    key_secret: process.env.key_secret,
});

exports.payment = (amount) => {
    return new Promise((resolve, reject) => {
        var options = {
            amount: amount,
            currency: "INR",
            receipt: "order_rcptid_11"
        };
        instance.orders.create(options, function (err, order) {
            resolve(order)
        })
    })
}

exports.verifyPayment = (payment) => {
    return new Promise((resolve, reject) => {
        let body = payment.razorpay_order_id + "|" + payment.razorpay_payment_id;
        var expectedSignature = crypto.createHmac('sha256', instance.key_secret)
            .update(body.toString()).digest('hex');
        if (expectedSignature === payment.razorpay_signature) resolve()
        else reject()
    });
}