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

Watchlist.getWatchListCount = async function(userId){
  const count = await Watchlist.countDocuments({
    userId: userId,
    wantsToWatch: true
  });

  return count;
}
Watchlist.getWatchedCount = async function(userId){
  const count = await Watchlist.countDocuments({
    userId: userId,
    hasWatched: true
  });

  return count;
}
module.exports = Watchlist;