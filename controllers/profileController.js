const bcrypt = require('bcrypt');
const User = require("../models/user-model"); // Get user model to check if watched or not
const Watchlist = require("../models/watchlist-model");
const Review = require("../models/review-model");
const Movie = require("../models/movie-model");

// Get the user info to render the profile page
exports.getProfile = async (req, res) => {
  const userId = req.session.user.userId;
  // Fetch user from database using session userId
  const user = await User.findById(userId);
  const watchlistCount = await Watchlist.getWatchListCount(userId);
  const watchedCount = await Watchlist.getWatchedCount(userId);
  const reviewCount = await Review.getreviewCountbyuserID(
    req.session.user.userId,
  );
  const genres = await Movie.getDistinctGenres()
  // Calculate total hours watched by user
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
    totalHours: totalHours.toFixed(1),
    genreOptions: genres,
  });
};

// Get the user info to render the edit profile page with pre-filled values
exports.renderEditProfile = async (req, res) => {
  // Fetch user from database using session userId
  const userId = req.session.user.userId;
  const user = await User.findById(userId);
  // include genre options for manage favorites
  const genres = await Movie.getDistinctGenres()
  res.render("edit-profile", { user: user, error: "", genreOptions:genres });
};

// Edit user info in database with new values from edit profile form
exports.editUser = async (req, res) => {
  const { name, email, password } = req.body;
  const userId = req.session.user.userId;
  let { genres } = req.body;

  //If name or email is missing, render edit profile page with error message
  if (!email || !name) {
    const user = await User.findById(userId);
    return res.render("edit-profile", {
      user: user,
      error: "Please Enter Name and Email",
    });
  }

  // Check if email is already in use by another user
  const existingUser = await User.findOne({
    email,
    _id: { $ne: userId }, // Exclude current user's ID
  });

  // If email is already in use, render edit profile page with error message 
  if (existingUser) {
    const user = await User.findById(userId);
    return res.render("edit-profile", {
      user: user,
      error: "Email already in use",
    });
  }

  // Only hash password if a new one is provided and is not just whitespace
  const updateFields = { name, email };
  if (password && password.trim().length > 0) {
    updateFields.password = await bcrypt.hash(password, 10);
  }

  // - no selection -> empty array
  if (!genres) {
    updateFields.favoriteGenres = [];
  // - single genre -> wrap in array
  } else if (!Array.isArray(genres)) { //if not an array, wrap in array
    updateFields.favoriteGenres = [genres];
  // - multiple genres -> preserve array
  } else {
    updateFields.favoriteGenres = genres;
  }

  // Update user document in database with new values
  await User.findByIdAndUpdate(userId, updateFields, {
    new: true, // Return the updated document
    runValidators: true, // Ensure validation rules are applied to updated fields
  });

  // Redirect to profile after successful update
  res.redirect("/profile");
};

// Render delete confirmation page
exports.renderDeleteUser = async (req, res) => {
  res.render("user-delete-confirmation");
}

// Delete user from database and destroy session
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.session.user.userId;
    await User.findByIdAndDelete(userId);
    // Destroy session after deleting user
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).render('profile', { error: 'Unable to delete account. Please try again.' });
      }
      res.redirect('/register');
    });
  } catch (error) {
    res.status(500).render('profile', { error: 'Unable to delete account. Please try again.' });
  }
};

// Logout user by destroying session
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.send("Error logging out");
    }
    res.redirect("/login");
  });
};
