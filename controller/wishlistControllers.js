const usermodel = require("../models/user-schema")
let user;

exports.getWishlist = (req, res) => {
    let userId = req.session.user._id
    user = req.session.user.name
    usermodel.findById(userId, { wishlist: 1 }).populate({ path: 'wishlist.product_id', model: 'Products', populate: { path: 'brandName', model: 'brandName' } })
        .then(async (result) => {
            let wishlist = result.wishlist
            res.render('userSide/wishlist', { wishlist, user })
        })
}

exports.addWishlist = async (req, res) => {
    let userId = req.session.user._id
    let wishlist = await usermodel.findOne({ _id: userId, 'wishlist.product_id': req.body.id })
        .catch((error) => res.json({ response: error.message }))
    if (wishlist) res.json({ response: "The Product is already in your wishlist" })
    else {
        usermodel.findByIdAndUpdate(userId, { $push: { wishlist: { product_id: req.body.id } } })
            .then(() => res.json({ response: false }))
            .catch((error) => res.json({ response: error.message }))
    }
}

exports.deleteWishlist = (req, res) => {
    let userId = req.session.user._id
    usermodel.findByIdAndUpdate(userId, { $pull: { wishlist: { _id: req.body.id } } }).then(() => {
        res.json({ response: false })
    }).catch(error => res.json({ response: error.message }))
}