const express = require("express");
const router = express.Router();
const User = require('../models/user-model');
const Review = require("../models/review-model");
const Movie = require("../models/movie-model");
const Watchlist = require("../models/watchlist-model");

const showWatchlist = async (req, res) => {
  try {
    const searchQuery = req.query.search || "";

    const watchlist = await Watchlist.find({
      userId: req.session.user.userId,
      wantsToWatch: true,
      hasWatched: false,
    }).populate("movieId");

    const alreadyWatched = await Watchlist.find({
      userId: req.session.user.userId,
      wantsToWatch: false,
      hasWatched: true,
    }).populate("movieId");

    const filterBySearch = (entries) => {
      if (!searchQuery) return entries;
      return entries.filter((entry) =>
        entry.movieId.movieTitle
          .toLowerCase()
          .includes(searchQuery.toLowerCase()),
      );
    };

    const ratingSummaries = await Review.getAllMovieRatingSummaries();

    return res.render("watchedMovies", {
      watchlist: filterBySearch(watchlist),
      alreadyWatched: filterBySearch(alreadyWatched),
      ratingSummaries,
      searchQuery,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error to fetch movies watched");
  }
};

const addToWatchlist = async (req, res) => {
  try {
    const movieId = req.body.movieId;

    await Watchlist.findOneAndUpdate(
      { userId: req.session.user.userId, movieId: movieId },
      {
        wantsToWatch: true,
        hasWatched: false,
        addDate: new Date(),
        watchTime: 0,
      },
      { upsert: true },
    );
    console.log("Successfully added to watchlist");
    return res.redirect(req.headers.referer || "/movie");
  } catch (error) {
    console.log(error);
    res.status(500).send("Error to add movie from watchlist");
  }
};

const removeFromWatchlist = async (req, res) => {
  try {
    const movieId = req.body.movieId;

    await Watchlist.updateOne(
      { userId: req.session.user.userId, movieId: movieId },
      { wantsToWatch: false, addDate: null },
    );

    console.log("Successfully removed from watchlist");
    return res.redirect(req.headers.referer || "/movie");
  } catch (error) {
    console.log(error);
    res.status(500).send("Error to remove movie from watchlist");
  }
};

const markAsWatched = async (req, res) => {
  try {
    const movieId = req.body.movieId;
    const movie = await Movie.findMoveById(movieId);
    const movieRunTime = movie.runTime;
    await Watchlist.updateOne(
      { userId: req.session.user.userId, movieId: movieId },
      {
        wantsToWatch: false,
        hasWatched: true,
        addDate: null,
        watchTime: movieRunTime,
      },
      { upsert: true },
    );

    console.log("Successfully marked as watched");
    return res.redirect(req.headers.referer || "/movie");
  } catch (error) {
    console.log(error);
    res.status(500).send("Error to mark movie as watched");
  }
};

const unmarkAsWatched = async (req, res) => {
  try {
    const movieId = req.body.movieId;
    await Watchlist.updateOne(
      { userId: req.session.user.userId, movieId: movieId },
      { wantsToWatch: false, hasWatched: false, watchTime: 0 },
    );

    console.log("Successfully unmarked as watched");
    return res.redirect(req.headers.referer || "/movie");
  } catch (error) {
    console.log(error);
    res.status(500).send("Error to mark movie as unwatched");
  }
};

const showRecommendations = async (req, res) => {
  try {
    const watched = await Watchlist.find({
      userId: req.session.user.userId,
      hasWatched: true,
    }).populate("movieId");

    const inWatchlist = await Watchlist.find({
      userId: req.session.user.userId,
      wantsToWatch: true,
    });

    // count genres
    const genreCount = {};
    watched.forEach((entry) => {
      const genre = entry.movieId.genre;
      genreCount[genre] = (genreCount[genre] || 0) + 1;
    });

    // get user favourite genres
    const rawUserFavouriteGenres = (await User.findById(req.session.user.userId)).favoriteGenres;

    // find top 3 genres
    const rawTopGenres = Object.keys(genreCount)
      .sort((a, b) => genreCount[b] - genreCount[a])
      .filter(genre => !rawUserFavouriteGenres.includes(genre))
      .slice(0, 3);

    // get all movies watched or in watchlist
    const excludedMovies = [
      ...inWatchlist.map((entry) => entry.movieId._id),
      ...watched.map((entry) => entry.movieId._id)
    ];
    // get movies not yet watched within top 3 genres
    const recommendations = await Movie.getMoviesByGenres(
      rawTopGenres,
      excludedMovies,
    );
    // get movies not yet watched from user fav genres
    const favoriteRecommendations = await Movie.getMoviesByGenres(
      rawUserFavouriteGenres,
      excludedMovies,
    );

    // Filter to not show genres that have no movie available for recommendation
    const userFavouriteGenres = rawUserFavouriteGenres.filter(genre => 
      favoriteRecommendations.some(movie => movie.genre === genre)
    );
     const topGenres = rawTopGenres.filter(genre =>
      recommendations.some(movie => movie.genre === genre)
    );

    const ratingSummaries = await Review.getAllMovieRatingSummaries();

    res.render("recommendations", { favoriteRecommendations, recommendations, topGenres, userFavouriteGenres, ratingSummaries });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error showing recommendations");
  }
};

module.exports = {
  showWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  showRecommendations,
  markAsWatched,
  unmarkAsWatched,
};
