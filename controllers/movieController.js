const Movie = require("../models/movie-model");
const Review = require("../models/review-model");
const validator = require("./utils/validation");
const User = require("../models/user-model");
const Watchlist = require("../models/watchlist-model");

// Get all movies from MongoDB and check if user watched or not
const getAllMovies = async (req, res) => {
  try {
    const loggedUser = req.session.user.userId;
    const user = await User.findOne({ _id: loggedUser });

    if (!loggedUser) {
      console.log("User not logged in, redirect to /login");
      return res.redirect("/login");
    }

    if (!user) {
      console.log("User does not exist, redirect to /login");
      return res.redirect("/login");
    }

    const watchedEntries = await Watchlist.find({
      userId: user._id,
      wantsToWatch: true
    });
    const watchedMovies = watchedEntries.map((entry) => entry.movieId.toString());

    let movieList = await Movie.getAllMovies();
    return res.render("all-movies", { movies: movieList, watchedMovies });
  } catch (error) {
    return res.status(500).send("Error getting all movies!");
  }
};

// Get the movie by its ObjectID and render the movie page
const getMovieById = async (req, res) => {
  if (validator.isInvalidId(req.params.id)) {
    return res.status(400).send("Invalid movie id.");
  }

  try {
    const movie = await Movie.findMoveById(req.params.id);

    if (!movie) {
      return res.send("No movie found!");
    }

    const reviews = await Review.getReviewsByMovieId(req.params.id);

    return res.render("movie", {
      movie: movie,
      reviews: reviews,
      currentUser: req.session.user,
      error: null
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Error fetching movie by ID");
  }
};

// Get the create movie form
const getCreateMovieForm = (req, res) => {
  return res.render("create-movie");
};

// Get the input from the movie form and create the movie object in MongoDB
const createMovie = async (req, res) => {
  const { movieTitle, movieDescription, releaseDate } = req.body;

  if (
    validator.isMissingText(movieTitle) ||
    validator.isMissingText(movieDescription) ||
    validator.isMissingText(releaseDate)
  ) {
    return res.status(400).send("All fields are required");
  }

  try {
    const newMovie = {
      movieTitle,
      movieDescription,
      releaseDate
    };

    await Movie.createMovie(newMovie);
    return res.status(201).send("Movie has been created successfully!");
  } catch (err) {
    return res.status(500).send("Error creating movie :(");
  }
};

// Get the movie object to be deleted and render the delete movie confirmation form
const getMovieToBeDeleted = async (req, res) => {
  const movieId = req.params.id;

  if (validator.isInvalidId(movieId)) {
    return res.status(400).send("Invalid movie id.");
  }

  try {
    const movie = await Movie.findMoveById(movieId);

    if (!movie) {
      return res.status(404).send("Movie not found!");
    }

    res.render("movie-delete", { movie: movie });
  } catch (error) {
    res.status(500).send("Error fetching the movie to be deleted");
  }
};

// Get the confirmation and delete the movie from MongoDB
const deleteMovie = async (req, res) => {
  try {
    const movieId = req.params.id;
    const movieFound = await Movie.findMoveById(movieId);

    if (!movieFound) {
      return res.status(404).send("Movie not found!");
    }

    await Movie.deleteMovieById(movieId);
    return res.send("Movie was deleted successfuly!");
  } catch (error) {
    return res.status(500).send("Movie could not be deleted!");
  }
};

// Get the movie info to edit movie and render the edit movie form
const getMovieToEdit = async (req, res) => {
  const movieId = req.params.id;

  try {
    let movieDetails = await Movie.findMoveById(movieId);

    if (!movieDetails) {
      return res.status(404).send("Movie not found!");
    }

    res.render("edit-movie", { movie: movieDetails });
  } catch (error) {
    res.status(500).send("Error fetching movie by ID");
  }
};

// Update the movie by getting the new info from the fields
const updateMovieDetails = async (req, res) => {
  const movieId = req.params.id;
  const { movieTitle, movieDescription, releaseDate } = req.body;

  if (validator.isInvalidId(movieId)) {
    return res.status(400).send("Invalid movie id.");
  }

  if (
    validator.isMissingText(movieTitle) ||
    validator.isMissingText(movieDescription) ||
    validator.isMissingText(releaseDate)
  ) {
    return res.status(400).send("All fields are required.");
  }

  try {
    await Movie.editMovieDetails(
      movieId,
      movieTitle.trim(),
      movieDescription.trim(),
      releaseDate
    );

    return res.send("Movie details have been successfuly updated!");
  } catch (error) {
    return res.status(500).send("Movie details could not be updated!");
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
  getMovieToEdit
};