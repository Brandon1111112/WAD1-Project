const User = require("../models/user-model"); // Get user model to check if watched or not
const Watchlist = require("../models/watchlist-model");
const Review = require("../models/review-model");

exports.editUser = async (req, res) => {
  // Extract user input from request body
  const { name, email, password } = req.body;
  const userId = req.session.user.userId;

  // Validate all required fields are provided
  if (!email || !password || !name) {
    const user = await User.findById(userId);
    return res.render("editProfile", {
      user: user,
      error: "Please Enter All Fields",
    });
  }

  // Check if email is already in use by another user
  const existingUser = await User.findOne({
    email,
    _id: { $ne: userId }, // Exclude current user's ID
  });

  if (existingUser) {
    const user = await User.findById(userId);
    return res.render("editProfile", {
      user: user,
      error: "Email already in use",
    });
  }

  // Update user document in database with new values
  await User.findByIdAndUpdate(
    userId,
    { name, email, password },
    { new: true, runValidators: true }, // Return updated document and run schema validation
  );

  // Redirect to profile after successful update
  res.redirect("/profile");
};

exports.getProfile = async (req, res) => {
  const userId = req.session.user.userId;
  // Fetch user from database using session userId
  const user = await User.findById(userId);
  const watchlistCount = await Watchlist.getWatchListCount(userId);
  const watchedCount = await Watchlist.getWatchedCount(userId);
  const reviewCount = await Review.getreviewCountbyuserID(
    req.session.user.userId,
  );
  let totalHours = 0;
  const allWatchedMovies = await Watchlist.getAllWatchedMovies(userId);
  allWatchedMovies.forEach((watchedMovies) => {
    totalHours += watchedMovies.watchTime;
  });
  totalHours = totalHours / 60; //timing shown in hrs, 1dp
  res.render("profile", {
    user: user,
    watchlistCount: watchlistCount,
    watchedCount: watchedCount,
    reviewCount: reviewCount,
    totalHours: totalHours,
  });
};

exports.renderEditProfile = async (req, res) => {
  // Fetch user from database using session userId
  const userId = req.session.user.userId;
  const user = await User.findById(userId);
  res.render("editprofile", { user: user, error: "" });
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.send("Error logging out");
    }
    res.redirect("/login");
  });
};
