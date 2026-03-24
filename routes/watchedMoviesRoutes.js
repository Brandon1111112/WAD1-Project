const express = require('express');
const router = express.Router();

const User = require('../models/user-model');
const auth = require('../middlewares/auth-middleware');

const watchedMovieController = require('../controllers/watchedMovieController');

// Show the user's watchlist
router.get('/list', auth.isLoggedIn, watchedMovieController.showWatchlist);
// Remove the movie from watchlist
router.post('/remove', auth.isLoggedIn, watchedMovieController.removeFromWatchlist);
// Add the movie to watchlist
router.post('/add', auth.isLoggedIn, watchedMovieController.addToWatchlist);
// Unmark movie as watched
router.post('/unwatch', auth.isLoggedIn, watchedMovieController.unmarkAsWatched)
// Mark movie as watched
router.post('/watch', auth.isLoggedIn, watchedMovieController.markAsWatched)
// Show user's movie recommendations
router.get('/recommended', auth.isLoggedIn, watchedMovieController.showRecommendations);
module.exports = router;