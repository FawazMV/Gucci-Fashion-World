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

import Cropper from 'cropperjs';

const Cropper = require('cropperjs')

const image = document.getElementById('image');
const cropper = new Cropper(image, {
    aspectRatio: 16 / 9,
    crop(event) {
        console.log(event.detail.x);
        console.log(event.detail.y);
        console.log(event.detail.width);
        console.log(event.detail.height);
        console.log(event.detail.rotate);
        console.log(event.detail.scaleX);
        console.log(event.detail.scaleY);
    },
});