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

module.exports = Movie;
