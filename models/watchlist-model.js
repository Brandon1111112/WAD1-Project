const mongoose = require("mongoose");

// Watchlist schema
const watchlistModel = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  movieId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Movie",
    required: true,
  },
  wantsToWatch: {
    type: Boolean,
    default: false,
  },
  addDate: {
    type: Date, default: Date.now
},
  hasWatched: {
    type: Boolean,
    default: false,
  },
  watchTime: {
    type: Number,
    default: 0,
  },
});

const Watchlist = mongoose.model("Watchlist", watchlistModel, "watchlist");

Watchlist.getWatchListCount = async function (userId) {
  const count = await Watchlist.countDocuments({
    userId: userId,
    wantsToWatch: true,
  });

  return count;
};
Watchlist.getWatchedCount = async function (userId) {
  const count = await Watchlist.countDocuments({
    userId: userId,
    hasWatched: true,
  });
  return count;
};

Watchlist.getAllWatchedMovies = async function (userId) {
  const listOfWatchedMovies = await Watchlist.find({
    userId: userId,
    hasWatched: true,
  });
  return listOfWatchedMovies;
};

module.exports = Watchlist;
