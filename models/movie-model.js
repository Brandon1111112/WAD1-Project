const mongoose = require("mongoose");

// Movie schema
const movieModel = new mongoose.Schema({
  movieTitle: {
    type: String,
    required: [true, "Movie must have a name"],
  },
  movieDescription: {
    type: String,
    required: [true, "Movie must have a description"],
  },
  releaseDate: {
    type: Date,
    required: [true, "Movie must have a release date"],
  },
  movieRating: {
    type: Number,
    required: [true, "Movie must have a rating"],
  },
  reviews: {
    type: Array,
    required: [false, "A movie can have no reviews"],
  },
  hasWatched: {
    type: Boolean,
    default: false,
  },
});

const Movie = mongoose.model("Movie", movieModel, "movie");

exports.getAllMovies = function () {
  return Movie.find();
};

exports.findMoveById = function (_id) {
  return Movie.findOne({ _id: _id });
};

exports.deleteMovieById = function (_id) {
  return Movie.deleteOne({ _id: _id });
};

exports.createMovie = function (newMovie) {
  return Movie.create(newMovie);
};

exports.editMovieDetails = function (
  _id,
  movieTitle,
  movieDescription,
  releaseDate,
) {
  return Movie.updateOne(
    { _id: _id },
    {
      movieTitle: movieTitle,
      movieDescription: movieDescription,
      releaseDate: releaseDate,
    },
  );
};

//module.exports = Movie;
