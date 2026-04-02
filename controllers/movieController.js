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

      if (user){
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
    return res.status(500).send("Error getting all movies!");
  }
};

// Get the movie by its ObjectID and render the movie page
const getMovieById = async (req, res) => {
  if (validator.isInvalidId(req.params.id)) {
    return res.status(400).send("Invalid movie id.");
  }

  try {
    // Get the movies by the given movie id
    const movie = await Movie.findMoveById(req.params.id);
    const error = req.session.error || null;
    req.session.error = null;

    if (!movie) {
      return res.send("No movie found!");
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
    return res.status(500).send("Error fetching movie by ID");
  }
};

// Get the create movie form
const getCreateMovieForm = (req, res) => {
  return res.render("create-movie");
};

// Get the input from the movie form and create the movie object in MongoDB
const createMovie = async (req, res) => {
  const { movieTitle, movieDescription, releaseDate, genre } = req.body;

  //Validations to check for missing values
  if (
    validator.isMissingText(movieTitle) ||
    validator.isMissingText(movieDescription) ||
    validator.isMissingText(releaseDate) ||
    validator.isMissingText(genre)
  ) {
    return res.status(400).send("All fields are required");
  }

  try {
    let moviePoster = "";
    let runTime = 0;
    const omdbApiKey = process.env.OMDB_API_KEY; //get API key from .env

    if (omdbApiKey) {
      // call the API endpoint by passing in the API key and title as arguments
      const url = `https://www.omdbapi.com/?apikey=${omdbApiKey}&t=${movieTitle.trim()}`;
      try {
        let data = await getJson(url);
        // if json response has a poster and poster not N/A then set poster value
        if (data.Poster && data.Poster !== "N/A") {
          moviePoster = data.Poster;
        } else if (data.Error) {
          console.log("OMDb lookup skipped:", data.Error, "for", movieTitle);
        }
        // get the movie runtime value as well from the API
        if (data.Runtime && data.Runtime !== "N/A") {
          runTime = validator.convertToNum(data.Runtime);
        } else if (data.Error) {
          console.log("OMDb lookup skipped:", data.Error, "for", movieTitle);
        }
      } catch (fetchError) {
        // If poster lookup fails, still create movie without poster.
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
    return res.status(500).send("Error creating movie :(");
  }
};

// Get the movie object to be deleted and render the delete movie confirmation form
const getMovieToBeDeleted = async (req, res) => {
  const movieId = req.params.id;

  //if invalid movie id return the status and message
  if (validator.isInvalidId(movieId)) {
    return res.status(400).send("Invalid movie id.");
  }

  try {
    //get the movie to be deleted by it's id
    const movie = await Movie.findMoveById(movieId);

    if (!movie) {
      return res.status(404).send("Movie not found!");
    }
    //render the delete confirmation page
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
    // Delete the movie and all its references from both the movies and the watchlist collections
    await Movie.deleteMovieById(movieId);
    await Watchlist.deleteMany({ movieId: movieId });
    
    await Logs.createALog(req.session.user.userId, `The movie ${movieFound.movieTitle} was deleted`, 'movie', movieId);
    // All the logs with same movieId (tragetId) will be marked as deleted (isDeleted:true)
    await Logs.updateMany({targetId:movieFound._id}, {isDeleted: true})
    // Redirect to all movies page after deletion
    return res.redirect("/movie");
  } catch (error) {
    return res.status(500).send("Movie could not be deleted!");
  }
};

// Get the movie info to edit movie and render the edit movie form
const getMovieToEdit = async (req, res) => {
  const movieId = req.params.id;
  //get the movie by it's id to be edited
  try {
    let movieDetails = await Movie.findMoveById(movieId);

    if (!movieDetails) {
      return res.status(404).send("Movie not found!");
    }
    //render the edit movie form
    res.render("edit-movie", { movie: movieDetails });
  } catch (error) {
    res.status(500).send("Error fetching movie by ID");
  }
};

// Update the movie by getting the new info from the fields
const updateMovieDetails = async (req, res) => {
  const movieId = req.params.id;
  const { movieTitle, genre, movieDescription, releaseDate } = req.body;

  //validate for invalid movie id
  if (validator.isInvalidId(movieId)) {
    return res.status(400).send("Invalid movie id.");
  }

  //validate for empty text fields
  if (
    validator.isMissingText(movieTitle) ||
    validator.isMissingText(movieDescription) ||
    validator.isMissingText(releaseDate) ||
    validator.isMissingText(genre)
  ) {
    return res.status(400).send("All fields are required.");
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
  getMovieToEdit,
};
