const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const { validateReview, isLoggedIn, isReviewOwner } = require("../middleware.js");
const reviewController = require("../controllers/review.js");

router.post("/:id/reviews",isLoggedIn, validateReview, wrapAsync(reviewController.createReview));

router.delete("/:id/reviews/:reviewId",isLoggedIn,isReviewOwner,wrapAsync(reviewController.deleteReview));

module.exports = router;
