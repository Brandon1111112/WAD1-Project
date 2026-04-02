const Review = require("../models/review-model");
const Movie = require("../models/movie-model");
const Logs = require('../models/logs-model');
const validator = require("./utils/validation");
const User = require("../models/user-model");

const addReview = async (req, res) => {
    const movieId = req.params.id;
    const { rating, review } = req.body;

    if (validator.isInvalidId(movieId)) {
        return res.status(400).render('error', { error: "Invalid movie id.", statusCode: 400 });
    }

    if (!req.session.user || !req.session.user.userId) {
        return res.status(401).render('error', { error: "You must be logged in to review.", statusCode: 401 });
    }

    if (!rating || !review || review.trim() === "") {
        return res.status(400).render('error', { error: "Rating and review are required.", statusCode: 400 });
    }

    try {
        const movie = await Movie.findMoveById(movieId);

        if (!movie) {
            return res.status(404).render('error', { error: "Movie not found", statusCode: 404 });
        }

        const existingReview = await Review.findReviewByUserAndMovie(
            req.session.user.userId,
            movieId
        );

        // Prevent duplicate review for same movie by same user
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

        const movieTitle = (await Movie.findById(movieId)).movieTitle;
        await Logs.createALog(req.session.user.userId, `Added a review for ${movieTitle}`, 'review', movieId);

        return res.redirect(`/movie/${movieId}`);
    } catch (error) {
        console.error(error);
        return res.status(500).render('error', { error: "Error adding review", statusCode: 500 });
    }
};

const getReviewToEdit = async (req, res) => {
    const reviewId = req.params.reviewId;

    if (validator.isInvalidId(reviewId)) {
        return res.status(400).render('error', { error: "Invalid review id.", statusCode: 400 });
    }

    try {
        const review = await Review.findReviewById(reviewId);

        if (!review) {
            return res.status(404).render('error', { error: "Review not found.", statusCode: 404 });
        }

        if (review.userId._id.toString() !== req.session.user.userId) {
            return res.status(403).render('error', { error: "You can only edit your own review.", statusCode: 403 });
        }

        return res.render("edit-review", { review: review });
    } catch (error) {
        console.error(error);
        return res.status(500).render('error', { error: "Error fetching review.", statusCode: 500 });
    }
};

const updateReview = async (req, res) => {
    const reviewId = req.params.reviewId;
    const { rating, review } = req.body;

    if (validator.isInvalidId(reviewId)) {
        return res.status(400).render('error', { error: "Review ID not found", statusCode: 400 });
    }

    if (!rating || !review || review.trim() === "") {
        return res.status(400).render('error', { error: "Rating and review are required.", statusCode: 400 });
    }

    try {
        const existingReview = await Review.findReviewById(reviewId);

        if (!existingReview) {
            return res.status(404).render('error', { error: "Review not found.", statusCode: 404 });
        }

        if (existingReview.userId._id.toString() !== req.session.user.userId) {
            return res.status(403).render('error', { error: "You can only update your own review.", statusCode: 403 });
        }

        await Review.updateReviewById(
            reviewId,
            Number(rating),
            review.trim()
        );

        const movieTitle = (await Movie.findById(existingReview.movieId)).movieTitle;
        await Logs.createALog(req.session.user.userId, `Edited a review for ${movieTitle}`, 'review', existingReview.movieId);
        return res.redirect(`/movie/${existingReview.movieId}`);
    } catch (error) {
        console.error(error);
        return res.status(500).render('error', { error: "Error updating review.", statusCode: 500 });
    }
};

const deleteReview = async (req, res) => {
    const reviewId = req.params.reviewId;

    if (validator.isInvalidId(reviewId)) {
        return res.status(400).render('error', { error: "Invalid review id.", statusCode: 400 });
    }

    try {
        const existingReview = await Review.findReviewById(reviewId);

        if (!existingReview) {
            return res.status(404).render('error', { error: "Review not found.", statusCode: 404 });
        }

        const reviewUserId =
            existingReview.userId && existingReview.userId._id
                ? existingReview.userId._id.toString()
                : null;

        const isOwner = reviewUserId === req.session.user.userId;
        const isAdmin =
            req.session.user.admin ||
            req.session.user.superAdmin ||
            req.session.user.isSuperAdmin;

        if (!isOwner && !isAdmin) {
            return res.status(403).render('error', { error: "You are not allowed to delete this review.", statusCode: 403 });
        }

        const movieId = existingReview.movieId;
        const movieTitle = (await Movie.findById(existingReview.movieId)).movieTitle;
        const userName = await User.findById(existingReview.userId) || 'Deleted user';

        if (req.session.user.admin || req.session.user.superAdmin) {
            await Logs.createALog(req.session.user.userId, `Deleted a review for ${movieTitle} of ${userName === 'Deleted user' ? 'Deleted user' : userName.name}`, 'review', existingReview.movieId, true);
        } else if (req.session.user) {
            await Logs.createALog(req.session.user.userId, `Deleted a review for ${movieTitle}`, 'review', existingReview.movieId, true);
        }

        await Review.deleteReviewById(reviewId);

        return res.redirect(`/movie/${movieId}`);
    } catch (error) {
        console.error(error);
        return res.status(500).render('error', { error: "Error deleting review.", statusCode: 500 });
    }
};

module.exports = {
    addReview,
    getReviewToEdit,
    updateReview,
    deleteReview
};