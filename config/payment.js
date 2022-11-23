// const Razorpay = require('razorpay');

// var instance = new Razorpay({
//     key_id: process.env.key_id,
//     key_secret: process.env.key_secret,
// });

// exports.payment = (amount)=>{
//     return new Promise((res, rej => {
//         var options = {
//             amount: amount,
//             currency:"INR",
//             receipt:"order_rcptid_11"
//         };
//         instance.orders.create(options,function(err,order){
//             console.log(order)
//         })
//     }))
// }