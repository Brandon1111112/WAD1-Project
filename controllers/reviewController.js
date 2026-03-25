const Review = require("../models/review-model");
const Movie = require("../models/movie-model");
const validator = require("./utils/validation");


const addReview = async (req, res) => {
    const movieId = req.params.id;
    const { rating, review } = req.body;

    if (validator.isInvalidId(movieId)) {
        return res.status(400).send("Invalid movie id.");
    }

    if (!req.session.user || !req.session.user.userId) {
        return res.status(401).send("You must be logged in to review.");
    }

    if (!rating || !review || review.trim() === "") {
        return res.status(400).send("Rating and review are required.");
    }

    try {
        const movie = await Movie.findMoveById(movieId);

        if (!movie) {
            return res.status(404).send("Movie not found");
        }

        const existingReview = await Review.findReviewByUserAndMovie(
            req.session.user.userId,
            movieId
        );

        if (existingReview) {
            req.session.error = "You have already reviewed this movie.";
            return res.redirect(`/movie/${movieId}`);
        }

        const newReview = {
            movieId: movieId,
            userId: req.session.user.userId,
            rating: Number(rating),
            review: review.trim()
        };

        await Review.createReview(newReview);

        return res.redirect(`/movie/${movieId}`);
    } catch (error) {
        console.error(error);
        return res.status(500).send("Error adding review");
    }
};

const getReviewToEdit = async (req, res) => {
    const reviewId = req.params.reviewId;

    if (validator.isInvalidId(reviewId)) {
        return res.status(400).send("Invalid review id.");
    }

    try {
        const review = await Review.findReviewById(reviewId);

        if (!review) {
            return res.status(404).send("Review not found.");
        }

        if (review.userId._id.toString() !== req.session.user.userId) {
            return res.status(403).send("You can only edit your own review.");
        }

        return res.render("edit-review", { review: review });
    } catch (error) {
        console.error(error);
        return res.status(500).send("Error fetching review.");
    }
};

const updateReview = async (req, res) => {
    const reviewId = req.params.reviewId;
    const { rating, review } = req.body;

    if (validator.isInvalidId(reviewId)) {
        return res.status(400).send("Invalid review id.");
    }

    if (!rating || !review || review.trim() === "") {
        return res.status(400).send("Rating and review are required.");
    }

    try {
        const existingReview = await Review.findReviewById(reviewId);

        if (!existingReview) {
            return res.status(404).send("Review not found.");
        }

        if (existingReview.userId._id.toString() !== req.session.user.userId) {
            return res.status(403).send("You can only update your own review.");
        }

        await Review.updateReviewById(
            reviewId,
            Number(rating),
            review.trim()
        );

        return res.redirect(`/movie/${existingReview.movieId}`);
    } catch (error) {
        console.error(error);
        return res.status(500).send("Error updating review.");
    }
};

const deleteReview = async (req, res) => {
    const reviewId = req.params.reviewId;

    if (validator.isInvalidId(reviewId)) {
        return res.status(400).send("Invalid review id.");
    }

    try {
        const existingReview = await Review.findReviewById(reviewId);

        if (!existingReview) {
            return res.status(404).send("Review not found.");
        }

        if (existingReview.userId._id.toString() !== req.session.user.userId) {
            return res.status(403).send("You can only delete your own review.");
        }

        const movieId = existingReview.movieId;

        await Review.deleteReviewById(reviewId);

        return res.redirect(`/movie/${movieId}`);
    } catch (error) {
        console.error(error);
        return res.status(500).send("Error deleting review.");
    }
};

module.exports = {
    addReview,
    getReviewToEdit,
    updateReview,
    deleteReview
};