const express = require("express");
const router = express.Router();
const movieController = require("../controllers/movieController");
const reviewController = require("../controllers/reviewController");
const auth = require("../middlewares/auth-middleware");

// Route to GET all movie objects
router.get("/", auth.isLoggedIn, movieController.getAllMovies);

// Route to GET the create movie form
router.get("/create", auth.isAdmin, movieController.getCreateMovieForm);

// Route to send a POST request to create a new movie object
router.post("/create", auth.isAdmin, movieController.createMovie);

// Route to GET the movie to be deleted
router.get("/delete/:id", auth.isAdmin, movieController.getMovieToBeDeleted);

// Route to send a POST request to delete the movie object
router.post("/delete/:id", auth.isAdmin, movieController.deleteMovie);

// Route to GET the movie object to be edited
router.get("/edit/:id", auth.isAdmin, movieController.getMovieToEdit);

// Route to send a POST request to edit the movie object
router.post("/edit/:id", auth.isAdmin , movieController.updateMovieDetails);

// Create review
router.post("/:id/review", auth.isLoggedIn, reviewController.addReview);

// Edit review form
router.get("/review/edit/:reviewId", auth.isLoggedIn, reviewController.getReviewToEdit);

// Update review
router.post("/review/edit/:reviewId", auth.isLoggedIn, reviewController.updateReview);

// Delete review
router.post("/review/delete/:reviewId", auth.isLoggedIn, reviewController.deleteReview);

// Route to GET a movie by its ID
router.get("/:id", auth.isLoggedIn, movieController.getMovieById);

module.exports = router;