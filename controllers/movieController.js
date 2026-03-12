const Movie = require("../models/movie-model");

const getAllMovies = async (req, res) => {
  try {
    const listOfMovies = await Movie.find({});
    return listOfMovies;
  } catch (error) {
    console.log("Server Error!");
  }
};

const getMovieById = async (req, res) => {
  try {
    let _id = req.params.id;
    const movie = await Movie.find({ _id: _id });
    return movie;
  } catch (error) {
    console.log("Server Error!")
  }
};

const createMovie = async (req, res) => {
  const { movieTitle, movieDescription, releaseDate, movieRating } = req.body;
  try {
    const newMovie = new Movie({
      movieTitle,
      movieDescription,
      releaseDate,
      movieRating,
      reviews: [],
      hasWatched: false,
    });
    await newMovie.save();
  } catch (err) {
    console.log("Error creating the movie");
  }
};

const deleteMovie = async (req, res) => {
  try {
    const movieTitle = req.body;
    const movieFound = Movie.findOne({ movieTitle: movieTitle });
    if (movieFound) {
      Movie.deleteOne({ movieTitle: movieTitle });
    } else {
      console.log("Movie name not found!");
    }
  } catch (error) {
    console.log("Server Error!");
  }
};

module.exports = { getAllMovies, getMovieById, createMovie, deleteMovie };
