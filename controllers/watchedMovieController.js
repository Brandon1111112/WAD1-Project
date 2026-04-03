const Logs = require('../models/logs-model');
const User = require('../models/user-model');
const Review = require("../models/review-model");
const Movie = require("../models/movie-model");
const Watchlist = require("../models/watchlist-model");

const showWatchlist = async (req, res) => {
  try {
    const searchQuery = req.query.search || "";

    // Find watchlist entries of the user and populate by the movieId
    const watchlist = await Watchlist.find({
      userId: req.session.user.userId,
      wantsToWatch: true,
      hasWatched: false,
    }).populate("movieId");
    // Find already watched entries of the user and populate by the movieId
    const alreadyWatched = await Watchlist.find({
      userId: req.session.user.userId,
      wantsToWatch: false,
      hasWatched: true,
    }).populate("movieId");

    // Filter fucntion to filter entries based on searchQuery
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
    return res.status(500).render("error", {
      error: "Error to fetch movies watched",
      statusCode: 500,
    });
  }
};

const addToWatchlist = async (req, res) => {
  try {
    const movieId = req.body.movieId;
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).render('error', { error: 'Movie not found', statusCode: 404 });
    }
    /* 
    It will find the document by the userId and movieId, 
    if document already exists it will update it, if it does not exist it will create a new document (upsert:true)
    */
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

    await Logs.createALog(req.session.user.userId, `Added ${movie.movieTitle} to watchlist`, 'watchlist');

    return res.redirect(req.headers.referer || "/movie");
  } catch (error) {
    console.log(error);
    return res.status(500).render("error", {
      error: "Error to add movie from watchlist",
      statusCode: 500,
    });
  }
};

const removeFromWatchlist = async (req, res) => {
  try {
    const movieId = req.body.movieId;
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).render('error', { error: 'Movie not found', statusCode: 404 });
    }

    await Watchlist.updateOne(
      { userId: req.session.user.userId, movieId: movieId },
      { wantsToWatch: false, addDate: null },
    );

    await Logs.createALog(req.session.user.userId, `Removed ${movie.movieTitle} from watchlist`, 'watchlist');

    return res.redirect(req.headers.referer || "/movie");
  } catch (error) {
    console.log(error);
    return res.status(500).render("error", {
      error: "Error to remove movie from watchlist",
      statusCode: 500,
    });
  }
};

const markAsWatched = async (req, res) => {
  try {
    const movieId = req.body.movieId;
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).render('error', { error: 'Movie not found', statusCode: 404 });
    }
    const movieRunTime = movie.runTime;
    
    /* 
    It will update/create the document using the userId and movieId, 
    if document already exists it will update it, if it does not exist it will create a new document (upsert:true)
    */
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

    await Logs.createALog(req.session.user.userId, `Marked ${movie.movieTitle} as watched`, 'watchlist');

    return res.redirect(req.headers.referer || "/movie");
  } catch (error) {
    console.log(error);
    return res.status(500).render("error", {
      error: "Error to mark movie as watched",
      statusCode: 500,
    });
  }
};

const unmarkAsWatched = async (req, res) => {
  try {
    const movieId = req.body.movieId;
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).render('error', { error: 'Movie not found', statusCode: 404 });
    }

    await Watchlist.updateOne(
      { userId: req.session.user.userId, movieId: movieId },
      { wantsToWatch: false, hasWatched: false, watchTime: 0 },
    );

    await Logs.createALog(req.session.user.userId, `Unmarked ${movie.movieTitle} as watched`, 'watchlist');

    return res.redirect(req.headers.referer || "/movie");
  } catch (error) {
    console.log(error);
    return res.status(500).render("error", {
      error: "Error to mark movie as unwatched",
      statusCode: 500,
    });
  }
};

const showRecommendations = async (req, res) => {
  try {
    // Get the movie watched by the user
    const watched = await Watchlist.find({
      userId: req.session.user.userId,
      hasWatched: true,
    }).populate("movieId");
    // Get the movie already in the user's watchlist
    const inWatchlist = await Watchlist.find({
      userId: req.session.user.userId,
      wantsToWatch: true,
    });

    // Count genres
    const genreCount = {};
    watched.forEach((entry) => {
      const genre = entry.movieId.genre;
      genreCount[genre] = (genreCount[genre] || 0) + 1;
    });

    // Get user favourite genres
    const rawUserFavouriteGenres = (await User.findById(req.session.user.userId)).favoriteGenres;

    // Find top 3 genres
    const rawTopGenres = Object.keys(genreCount)
      .sort((a, b) => genreCount[b] - genreCount[a])
      .filter(genre => !rawUserFavouriteGenres.includes(genre))
      .slice(0, 3);

    // Get the movies to exlude by combining movies watched or in watchlist
    const excludedMovies = [
      ...inWatchlist.map((entry) => entry.movieId),
      ...watched.map((entry) => entry.movieId._id)
    ];
    // Get movies not yet watched within top 3 genres
    const recommendations = await Movie.getMoviesByGenres(
      rawTopGenres,
      excludedMovies,
    );
    // Get movies not yet watched from user fav genres
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

    return res.render("recommendations", {
      favoriteRecommendations,
      recommendations,
      topGenres,
      userFavouriteGenres,
      ratingSummaries
    });
  } catch (error) {
    console.log(error);
    return res.status(500).render("error", {
      error: "Error showing recommendations",
      statusCode: 500,
    });
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