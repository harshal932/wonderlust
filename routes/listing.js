const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync=require("../utils/wrapAsync.js");
const ExpressError=require("../utils/ExpressError.js");
const {listingSchema}=require("../schema.js");
const Listing = require("../models/listing.js");
const {isLoggedIn, isOwner, validateListing}= require("../middleware.js");
const listingcontroller=require("../controllers/listing.js");
const multer  = require('multer');
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage });



const normalizeListingImage = (listing) => {
    if (!listing || typeof listing !== "object") {
        return listing;
    }

    if (typeof listing.image === "string") {
        listing.image = listing.image.trim() ? { url: listing.image.trim() } : undefined;
    }

    return listing;
};


router
    .route("/")
    .get( wrapAsync(listingcontroller.index)) // INDEX Route - Show all listings
    .post(isLoggedIn, validateListing,upload.single('listing[image]'), wrapAsync(listingcontroller.createListing))  // CREATE Route

router.get("/search", wrapAsync(async (req, res) => {
    const { q } = req.query;
    const query = q ? q.trim() : "";
    const allListings = query
        ? await Listing.find({ $or: [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } },
            { location: { $regex: query, $options: "i" } },
            { country: { $regex: query, $options: "i" } }
        ] })
        : await Listing.find({});

    res.render("listings/index", { allListings });
}));

// NEW Route - Form
router.get("/new", isLoggedIn ,listingcontroller.renderNewForm);



router
    .route("/:id")
    .get( wrapAsync(listingcontroller.showListing)) //show route
    .put(isLoggedIn,isOwner, upload.single('listing[image]'),validateListing, wrapAsync(listingcontroller.updateListing))// update route
    .delete(isLoggedIn,isOwner,wrapAsync (listingcontroller.deleteListing));



// EDIT Route
router.get("/:id/edit", isLoggedIn,isOwner,wrapAsync(listingcontroller.renderEditForm));

module.exports = router;