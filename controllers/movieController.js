const Movie = require("../models/movie-model");

const getAllMovies = async (req, res) => {
  try {
    let movieList = await Movie.getAllMovies();
    res.render("all-movies", { movies: movieList });
  } catch (error) {
    res.send("Error getting all books!");
  }
};

const getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findMoveById(req.params.id);
    if (!movie) {
      return res.send("No movie found!");
    }
    res.render("movie", { movie: movie });
  } catch (error) {
    res.send("Error fetching movie by ID");
  }
};

const getCreateMovieForm = (req, res) => {
  res.render("create-movie");
};

const createMovie = async (req, res) => {
  const { movieTitle, movieDescription, releaseDate, movieRating } = req.body;
  try {
    const newMovie = { movieTitle, movieDescription, releaseDate, movieRating };
    await Movie.createMovie(newMovie);
    res.send("Movie has been created successfuly!");
  } catch (err) {
    console.log("Error creating the movie");
  }
};

const getMovieToBeDeleted = async (req, res) => {
  const movieId = req.params.id;
  const movie = await Movie.findMoveById(movieId);
  res.render("movie-delete", { movie: movie });
};

const deleteMovie = async (req, res) => {
  try {
    const movieId = req.params.id;
    const movieFound = await Movie.findMoveById(movieId);
    if (!movieFound) {
      return res.status(404).send("Movie not found!");
    }

    await Movie.deleteMovieById(movieId);
    res.send("Movie was deleted successfuly!");
  } catch (error) {
    res.send("Movie could not be deleted!");
  }
};

const getMovieToEdit = async (req, res) => {
  const movieId = req.params.id;
  try {
    let movieDetails = await Movie.findMoveById(movieId);
    res.render("edit-movie", { movie: movieDetails });
  } catch (error) {
    res.send("Error fetching movie by ID");
  }
};
const updateMovieDetails = async (req, res) => {
  const movieId = req.params.id;
  const { movieTitle, movieDescription, releaseDate } = req.body;
  try {
    if (movieId) {
      await Movie.editMovieDetails(
        movieId,
        movieTitle,
        movieDescription,
        releaseDate,
      );
      res.send("Movie details have been successfuly updated!");
    }
  } catch (error) {
    res.send("Movie details could not be updated!");
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
