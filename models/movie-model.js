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
  moviePoster: {
    type: String,
    default: "",
  },
  releaseDate: {
    type: Date,
    required: [true, "Movie must have a release date"],
  },
  genre: {
    type: String,
    required: [true, "Movie must have a genre"]
  }
});

const Movie = mongoose.model("Movie", movieModel, "movie");

Movie.getAllMovies = function () {
  return Movie.find();
};

Movie.findMoveById = function (_id) {
  return Movie.findOne({ _id: _id });
};

Movie.deleteMovieById = function (_id) {
  return Movie.deleteOne({ _id: _id });
};

Movie.createMovie = function (newMovie) {
  return Movie.create(newMovie);
};

Movie.editMovieDetails = function (
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

Movie.getMoviesByGenres = function (genres, excludeIds) {
  return Movie.find({
    genre: { $in: genres },
    _id: { $nin: excludeIds }
  }).limit(10);
};

module.exports = Movie;
