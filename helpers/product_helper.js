exports.OfferPrice = (disc, total) => {
    let discount = Math.round(total * disc / 100)
    return total - discount
}