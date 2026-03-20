const express = require('express');
const router = express.Router();

const User = require('../models/user-model');
const auth = require('../middlewares/auth-middleware');

const watchedMovieController = require('../controllers/watchedMovieController');

// List all the movies the user has watched
router.get('/list', auth.isLoggedIn, watchedMovieController.showMovieList);
// Update the DB to remove the movie from movieWatched
router.post('/unwatch', auth.isLoggedIn, watchedMovieController.markAsUnwatched);
// Update the DB to add the movie to movieWatched
router.post('/watch', auth.isLoggedIn, watchedMovieController.markAsWatched);

module.exports = router;