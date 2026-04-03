const bcrypt = require('bcrypt');
const Logs = require('../models/logs-model');
const User = require("../models/user-model"); // Get user model to check if watched or not
const Watchlist = require("../models/watchlist-model");
const Review = require("../models/review-model");
const Movie = require("../models/movie-model");

// Register new user with validation
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate all required fields
        if (!name || !email || !password) {
            return res.render('register', { error: 'Please enter all fields' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.render('register', { error: 'Email already in use' });
        }

        // Hash password and create new user
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name,
            email,
            password: hashedPassword, // Use 'password' field to match schema
            admin: false,
            superAdmin: false
        });

        await newUser.save();

        await Logs.createALog(newUser._id, `${newUser.name} has created an account`, 'profile');
        return res.redirect('/');

    } catch (err) {
        console.error('Server error:', err);
        res.render('register', { error: 'Server error. Please try again.' });
    }
}

//Data validation of Login details
const loginUser = async (req, res) => {
    const { email, password } = req.body
    try {
        //Check if email exists in database
        const user = await User.findOne({ email })

        //If email not found, render login page with error message
        if (!user) {
            return res.render('login', { error: "Email not found" })
        }
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.render('login', { error: "Wrong password" })
        }

        //Initialise session with user infos if successful login
        req.session.user = {
            userId: user._id,
            admin: user.admin,
            superAdmin: user.superAdmin
        }
        await Logs.createALog(req.session.user.userId, `User logged in`, 'profile');
        //If user is admin, redirect to admin page, else redirect to home page
        if (user.admin === true) {
            return res.redirect('/admin')
        }
        res.redirect('/')

        // catch any error and render login page with error message
    } catch (error) {
        res.render('login', { error: "Server error" })
    }
}

const getProfile = async (req, res) => {
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
const renderEditProfile = async (req, res) => {
    // Fetch user from database using session userId
    const userId = req.session.user.userId;
    const user = await User.findById(userId);
    // include genre options for manage favorites
    const genres = await Movie.getDistinctGenres()
    res.render("edit-profile", { user: user, error: "", genreOptions: genres });
};

// Edit user info in database with new values from edit profile form
const editUser = async (req, res) => {
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
    await Logs.createALog(req.session.user.userId, `User details were edited`, 'profile');
    // Redirect to profile after successful update
    res.redirect("/profile");
};

// Render delete confirmation page
const renderDeleteUser = async (req, res) => {
    res.render("user-delete-confirmation");
}

// Delete user from database and destroy session
const deleteUser = async (req, res) => {
    try {
        const userId = req.session.user.userId;
        await User.findByIdAndDelete(userId);
        await Watchlist.deleteMany({userId:userId});

        await Logs.createALog(userId, 'Account was deleted', 'profile');
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
const logout = async (req, res) => {
    await Logs.createALog(req.session.user.userId, `User logged out`, 'profile');
    req.session.destroy((err) => {
        if (err) {
            return res.send("Error logging out");
        }
        res.redirect("/login");
    });
};

module.exports = {
    registerUser,
    loginUser,
    getProfile,
    renderEditProfile,
    editUser,
    renderDeleteUser,
    deleteUser,
    logout,
};