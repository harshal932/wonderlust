const Listing = require("./models/listing");
const Review = require("./models/review");
const { reviewSchema, listingSchema } = require("./schema.js");
const ExpressError = require("./utils/ExpressError");


module.exports.isLoggedIn=(req,res,next)=>{

     if(!req.isAuthenticated()){
        req.session.redirectUrl= req.originalUrl;
        req.flash("error","You must log in!");
        return res.redirect("/login");
    }
    next();
}

module.exports.saveRedirectUrl=(req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl=req.session.redirectUrl;
        delete req.session.redirectUrl;
    }
    next();
}

module.exports.isOwner=async (req,res,next)=>{
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing) {
        return next(new ExpressError(404, "Listing not found"));
    }
    if (!listing.owner.equals(res.locals.currUser._id)){
        req.flash("error"," You don't have permission to do that!");
        return res.redirect(`/listings/${id}`);
    }
    next();

}
module.exports.validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};
module.exports.validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) { // error occurs in case of missing form data (e.g. no title or price)
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

module.exports.isReviewOwner=async (req,res,next)=>{
    let { id, reviewId } = req.params;
    let review = await Review.findById(reviewId);
    if (!review) {
        return next(new ExpressError(404, "Review not found"));
    }
    if (!review.author.equals(res.locals.currUser._id)){
        req.flash("error"," You are not author of the review!");
        return res.redirect(`/listings/${id}`);
    }
    next();

}