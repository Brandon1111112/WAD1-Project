const User = require('../models/user-model'); // Get user model to check if watched or not
const Watchlist = require("../models/watchlist-model");
const Review = require("../models/review-model");

exports.editUser = async (req, res) => {
    // Extract user input from request body
    const { name, email, password } = req.body;
    const userId = req.session.user.userId;

    // Validate all required fields are provided
    if (!email || !password || !name) {
        return res.render('editProfile', {
            user: req.session.user,
            error: 'Please Enter All Fields'
        });
    }

    // Check if email is already in use by another user
    const existingUser = await User.findOne({
        email,
        _id: { $ne: userId } // Exclude current user's ID
    });

    if (existingUser) {
        return res.render('editProfile', {
            user: req.session.user,
            error: 'Email already in use'
        });
    }

    // Update user document in database with new values
    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { name, email, password },
        { new: true, runValidators: true } // Return updated document and run schema validation
    );

    // Sync updated user data to session for immediate use
    req.session.user = {
        userId: updatedUser._id,
        userName: updatedUser.name,
        email: updatedUser.email,
        password: updatedUser.password,
        isAdmin: updatedUser.admin,
        profilePic: req.session.user.profilePic // Preserve existing profile picture
    };
    
    res.redirect('/profile');
}

exports.getProfile = async (req, res) => {
    const user = req.session.user
    const watchlistCount = await Watchlist.getWatchListCount(req.session.user.userId)
    const watchedCount = await Watchlist.getWatchedCount(req.session.user.userId)
    const reviewCount = await Review.getreviewCountbyuserID(req.session.user.userId)
    res.render('profile',{user:user,watchlistCount: watchlistCount,watchedCount: watchedCount,reviewCount:reviewCount});
};

exports.renderEditProfile = (req, res) => {
    const user = req.session.user
    res.render('editprofile',{user:user,error:""});
}

exports.logout = (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.send('Error logging out');
      }
      res.redirect('/login');
    });
  };