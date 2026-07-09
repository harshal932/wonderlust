const Listing = require("../models/listing.js");
const ExpressError = require("../utils/ExpressError.js");

const normalizeListingImage = (listing) => {
    if (!listing || typeof listing !== "object") {
        return listing;
    }

    if (typeof listing.image === "string") {
        listing.image = listing.image.trim() ? { url: listing.image.trim() } : undefined;
    }

    return listing;
};

module.exports.index= async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index", { allListings });
};

module.exports.renderNewForm= (req, res) => {
    res.render("listings/new");
}

module.exports.showListing = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({ path: "reviews", populate: {path:"author"},})
        .populate("owner");

    if (!listing) {
        throw new ExpressError(404, "Listing not found");
    }

    res.render("listings/show", { listing });
}

module.exports.createListing= async (req, res) => {
    let url = req.file.path;
    let filename = req.file.filename;
    normalizeListingImage(req.body.listing);
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image= {url,filename};  
    await newListing.save();
    req.flash("success","Successfully created a new listing!");
    res.redirect("/listings");
}

module.exports.renderEditForm= async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        throw new ExpressError(404, "Listing not found");
    }
    let originalImageUrl = "/default.jpg";
    if (listing.image && listing.image.url) {
        originalImageUrl = listing.image.url.replace("/upload", "/upload/h_300,w_250");
    }
    res.render("listings/edit", { listing, originalImageUrl });
}

module.exports.updateListing= async (req, res) => {
    const { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    if(typeof req.file != "undefined"){
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = {url,filename};
    await listing.save();
    
    }
    req.flash("success","Listing updated!");
    res.redirect(`/listings/${id}`);
}
module.exports.deleteListing = async (req, res) => {
    const { id } = req.params;
    let deleteListing = await Listing.findByIdAndDelete(id);
    console.log(deleteListing);
    req.flash("success","Successfully deleted the listing!");
    res.redirect("/listings");
}