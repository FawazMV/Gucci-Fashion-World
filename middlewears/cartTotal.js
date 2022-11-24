// const usermodel = require("../models/user-schema")

// exports.cartSubtotal = async (userId, a) => {
//     total = await usermodel.findById(userId, { cart: 1 }).populate({ path: 'cart.product_id', model: 'Products' })
//         .then(async (result) => {
//             cartproduct = result.cart
//             total = await cartproduct.map(x => x.quantity * x.product_id.shopPrice).reduce((acc, curr) => {
//                 acc = acc + curr
//                 return acc
//             }, 0)
//         })
//     a(total)
// }