const Movie = require("../models/movie-model");
const Review = require("../models/review-model");
const validator = require("./utils/validation");
const User = require("../models/user-model");
const Watchlist = require("../models/watchlist-model");
const Logs = require('../models/logs-model');

//Fetch the API response from the URL and return the JSON response
async function getJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

// Get all movies from MongoDB and check if user watched or not
const getAllMovies = async (req, res) => {
  try {
    // Get the search and genre queries to filter and search
    const searchQuery = req.query.search || "";
    const genreQuery = req.query.genre || "";

    // Get all genres
    const genres = await Movie.getDistinctGenres();

    let watchlist = [];
    let alreadyWatched = [];
    let currentUser = null;

    // Get currently logged in user and their data about their watched movies
    if (req.session.user){
      const user = await User.findOne({ _id: req.session.user.userId });

      if (user) {
        currentUser = req.session.user;
        // Get movies that user wants to watch but has not watched yet
        const watchedEntries = await Watchlist.find({
          userId: user._id,
          wantsToWatch: true,
          hasWatched: false,
        });

        watchlist = watchedEntries.map((entry) => entry.movieId.toString());

        // Get movies that user has already watched 
        const watchedMovies = await Watchlist.find({
          userId: user._id,
          wantsToWatch: false,
          hasWatched: true,
        });
        alreadyWatched = watchedMovies.map((entry) =>
          entry.movieId.toString(),
        );
      }
    }

    const ratingSummaries = await Review.getAllMovieRatingSummaries();

    let movieList = await Movie.getAllMovies();

    // Filter movie selection by the query of search bar
    if (searchQuery) {
      movieList = movieList.filter(movie =>
        movie.movieTitle.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    // Filter movie selection by the genre
    if (genreQuery) {
      movieList = movieList.filter(movie =>
        movie.genre.toLowerCase().includes(genreQuery.toLowerCase())
      );
    }

    return res.render("all-movies", {
      movies: movieList,
      genres,
      watchlist,
      alreadyWatched,
      currentUser,
      ratingSummaries,
      searchQuery,
      genreQuery
    });
  } catch (error) {
    return res.status(500).render("error", { error: "Error getting all movies!", statusCode: 500 });
  }
};

const getMovieById = async (req, res) => {
  if (validator.isInvalidId(req.params.id)) {
    return res.status(400).render("error", { error: "Invalid movie id.", statusCode: 400 });
  }

  try {
    // Get the movies by the given movie id
    const movie = await Movie.findMovieById(req.params.id);
    const error = req.session.error || null;
    req.session.error = null;

    if (!movie) {
      return res.render("error", { error: "No movie found!", statusCode: 404 });
    }

    const reviews = await Review.getReviewsByMovieId(req.params.id);

    // Find the user's watchlist, if any
    const wantsToWatch = await Watchlist.find({
      userId: req.session.user.userId,
      wantsToWatch: true,
      hasWatched: false,
    });
    // Array of movies in the user's watchlist
    const watchlist = wantsToWatch.map((entry) => entry.movieId.toString());

    // Find movies the user has already watched
    const hasWatched = await Watchlist.find({
      userId: req.session.user.userId,
      wantsToWatch: false,
      hasWatched: true,
    });
    // Array of movies the user has already watched
    const alreadyWatched = hasWatched.map((entry) => entry.movieId.toString());

    const ratingSummary = await Review.getRatingSummaryByMovieId(req.params.id);

    let avgRating = 0;
    let totalReviews = 0;

    if (ratingSummary.length > 0) {
      avgRating = ratingSummary[0].avgRating;
      totalReviews = ratingSummary[0].totalReviews;
    }

    return res.render("movie", {
      movie: movie,
      reviews: reviews,
      currentUser: req.session.user,
      error,
      watchlist,
      alreadyWatched,
      avgRating,
      totalReviews,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).render("error", { error: "Error fetching movie by ID", statusCode: 500 });
  }
};

const getCreateMovieForm = (req, res) => {
  return res.render("create-movie");
};

const createMovie = async (req, res) => {
  const { movieTitle, movieDescription, releaseDate, genre } = req.body;

  if (
    validator.isMissingText(movieTitle) ||
    validator.isMissingText(movieDescription) ||
    validator.isMissingText(releaseDate) ||
    validator.isMissingText(genre)
  ) {
    return res.status(400).render("error", { error: "All fields are required", statusCode: 400 });
  }

  try {
    let moviePoster = "";
    let runTime = 0;
    const omdbApiKey = process.env.OMDB_API_KEY;

    if (omdbApiKey) {
      const url = `https://www.omdbapi.com/?apikey=${omdbApiKey}&t=${movieTitle.trim()}`;
      try {
        let data = await getJson(url);
        if (data.Poster && data.Poster !== "N/A") {
          moviePoster = data.Poster;
        } else if (data.Error) {
          console.log("OMDb lookup skipped:", data.Error, "for", movieTitle);
        }
        if (data.Runtime && data.Runtime !== "N/A") {
          runTime = validator.convertToNum(data.Runtime);
        } else if (data.Error) {
          console.log("OMDb lookup skipped:", data.Error, "for", movieTitle);
        }
      } catch (fetchError) {
        console.log("OMDb lookup failed:", fetchError.message);
      }
    }
    const newMovie = {
      movieTitle,
      movieDescription,
      releaseDate,
      genre,
      runTime,
      moviePoster,
    };

    const createdMovie = await Movie.createMovie(newMovie);
    await Logs.createALog(req.session.user.userId, `The movie ${newMovie.movieTitle} was added`, 'movie', createdMovie._id);
    // Redirect to the new movie's page
    return res.redirect(`/movie/${createdMovie._id}`);
  } catch (err) {
    return res.status(500).render("error", { error: "Error creating movie :(", statusCode: 500 });
  }
};

const getMovieToBeDeleted = async (req, res) => {
  const movieId = req.params.id;

  if (validator.isInvalidId(movieId)) {
    return res.status(400).render("error", { error: "Invalid movie id.", statusCode: 400 });
  }

  try {
    const movie = await Movie.findMovieById(movieId);

    if (!movie) {
      return res.status(404).render("error", { error: "Movie not found!", statusCode: 404 });
    }

    res.render("movie-delete", { movie: movie });
  } catch (error) {
    return res.status(500).render("error", { error: "Error fetching the movie to be deleted", statusCode: 500 });
  }
};

const deleteMovie = async (req, res) => {
  try {
    const movieId = req.params.id;
    const movieFound = await Movie.findMovieById(movieId);

    if (!movieFound) {
      return res.status(404).render("error", { error: "Movie not found!", statusCode: 404 });
    }
    // Delete the movie and all its references from both the movies and the watchlist collections
    await Movie.deleteMovieById(movieId);
    await Watchlist.deleteMany({ movieId: movieId });
    await Review.deleteMany({ movieId: movieId });
    
    await Logs.createALog(req.session.user.userId, `The movie ${movieFound.movieTitle} was deleted`, 'movie', movieId);
    // All the logs with same movieId (tragetId) will be marked as deleted (isDeleted:true)
    await Logs.updateMany({targetId:movieFound._id}, {isDeleted: true})
    // Redirect to all movies page after deletion
    return res.redirect("/movie");
  } catch (error) {
    return res.status(500).render("error", { error: "Movie could not be deleted!", statusCode: 500 });
  }
};

const getMovieToEdit = async (req, res) => {
  const movieId = req.params.id;

  try {
    let movieDetails = await Movie.findMovieById(movieId);

    if (!movieDetails) {
      return res.status(404).render("error", { error: "Movie not found!", statusCode: 404 });
    }

    res.render("edit-movie", { movie: movieDetails });
  } catch (error) {
    return res.status(500).render("error", { error: "Error fetching movie by ID", statusCode: 500 });
  }
};

const updateMovieDetails = async (req, res) => {
  const movieId = req.params.id;
  const { movieTitle, genre, movieDescription, releaseDate } = req.body;

  if (validator.isInvalidId(movieId)) {
    return res.status(400).render("error", { error: "Invalid movie id.", statusCode: 400 });
  }

  if (
    validator.isMissingText(movieTitle) ||
    validator.isMissingText(movieDescription) ||
    validator.isMissingText(releaseDate) ||
    validator.isMissingText(genre)
  ) {
    return res.status(400).render("error", { error: "All fields are required.", statusCode: 400 });
  }

  try {
    await Movie.editMovieDetails(
      movieId,
      movieTitle.trim(),
      genre,
      movieDescription.trim(),
      releaseDate,
    );
    await Logs.createALog(req.session.user.userId, `The movie ${movieTitle} was edited`, 'movie', movieId);
    // Redirect to the updated movie's page
    return res.redirect(`/movie/${movieId}`);
  } catch (error) {
    return res.status(500).render("error", { error: "Movie details could not be updated!", statusCode: 500 });
  }
};

module.exports = {
  getAllMovies,
  getCreateMovieForm,
  getMovieById,
  createMovie,
  deleteMovie,
  updateMovieDetails,
  getMovieToBeDeleted,
  getMovieToEdit,
};