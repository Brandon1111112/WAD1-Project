const mongoose = require("mongoose");

const reviewModel = new mongoose.Schema({
    movieId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Movie",
        required: [true, "Review must belong to a movie"]
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Review must belong to a user"]
    },
    rating: {
        type: Number,
        required: [true, "Review must have a rating"],
        min: 1,
        max: 5
    },
    review: {
        type: String,
        required: [true, "Review must have text"],
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Review = mongoose.model("Review", reviewModel, "reviews");

Review.getreviewCountbyuserID = async function(userId){
  const count = await Review.countDocuments({
    userId: userId
  });

  return count;
}

Review.createReview = function (newReview) {
    return Review.create(newReview);
};

Review.getReviewsByMovieId = function (movieId) {
    return Review.find({ movieId: movieId })
        .populate("userId")
        .sort({ createdAt: -1 });
};

Review.findReviewById = function (_id) {
    return Review.findOne({ _id: _id }).populate("userId");
};

Review.updateReviewById = function (_id, rating, review) {
    return Review.updateOne(
        { _id: _id },
        {
            rating: rating,
            review: review
        }
    );
};

Review.deleteReviewById = function (_id) {
    return Review.deleteOne({ _id: _id });
};

Review.findReviewByUserAndMovie = function (userId, movieId) {
    return Review.findOne({ userId: userId, movieId: movieId });
};

Review.getAllMovieRatingSummaries = function () {
    return Review.aggregate([
        {
            $group: {
                _id: "$movieId",
                avgRating: { $avg: "$rating" },
                totalReviews: { $sum: 1 }
            }
        }
    ]);
};

Review.getRatingSummaryByMovieId = function (movieId) {
    return Review.aggregate([
        {
            $match: {
                movieId: new mongoose.Types.ObjectId(movieId)
            }
        },
        {
            $group: {
                _id: "$movieId",
                avgRating: { $avg: "$rating" },
                totalReviews: { $sum: 1 }
            }
        }
    ]);
};

module.exports = Review;