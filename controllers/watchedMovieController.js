const express = require("express");
const router = express.Router();
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

    // count genres
    const genreCount = {};
    watched.forEach((entry) => {
      const genre = entry.movieId.genre;
      genreCount[genre] = (genreCount[genre] || 0) + 1;
    });

    // find top 3 genres
    const topGenres = Object.keys(genreCount)
      .sort((a, b) => genreCount[b] - genreCount[a])
      .slice(0, 3);

    // find movies not yet watched
    const watchedMovies = watched.map((entry) => entry.movieId._id);
    const recommendations = await Movie.getMoviesByGenres(
      topGenres,
      watchedMovies,
    );

    res.render("recommendations", { recommendations, topGenres });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error showing reccomendation");
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
