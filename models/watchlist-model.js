const mongoose = require("mongoose");

// Watchlist schema
const watchlistModel = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', require: true
},
  movieId: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Movie', require: true
},
  wantsToWatch: {
    type: Boolean, default: false
},
  addDate: {
    type: Date, default: Date.now
},
  hasLiked: {
    type: Boolean, default: false
},
  hasWatched: {
    type: Boolean, default: false
},
});

const Watchlist = mongoose.model("Watchlist", watchlistModel, "watchlist");

module.exports = Watchlist;