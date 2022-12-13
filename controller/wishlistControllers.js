const usermodel = require("../models/user-schema")

exports.getWishlist = (req, res, next) => {
    try {
        let userId = req.session.user._id
        let user = req.session.user.name
        usermodel.findById(userId, { wishlist: 1 }).populate({ path: 'wishlist.product_id', model: 'Products', populate: { path: 'brandName', model: 'brandName' } })
            .then(async (result) => {
                let wishlist = result.wishlist
                res.render('userSide/wishlist', { wishlist, user })
            })
    } catch (error) {
        next(error)
    }
}

exports.addWishlist = async (req, res, next) => {
    try {
        let userId = req.session.user._id
        let wishlist = await usermodel.findOne({ _id: userId, 'wishlist.product_id': req.body.id })
            .catch((error) => res.json({ response: error.message }))
        if (wishlist) res.json({ response: "The Product is already in your wishlist" })
        else {
            usermodel.findByIdAndUpdate(userId, { $push: { wishlist: { product_id: req.body.id } } })
                .then(() => res.json({ response: false }))
                .catch((error) => res.json({ response: error.message }))
        }
    } catch (error) {
        next(error)
    }
}

exports.deleteWishlist = (req, res, next) => {
    try {
        let userId = req.session.user._id
        usermodel.findByIdAndUpdate(userId, { $pull: { wishlist: { _id: req.body.id } } }).then(() => {
            res.json({ response: false })
        }).catch(error => res.json({ response: error.message }))
    } catch (error) {
        next(error)
    }
}