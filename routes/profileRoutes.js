const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth-middleware')
const profileController = require("../controllers/profileController");
const Watchlist = require("../models/watchlist-model");
const Review = require("../models/review-model");


//Render profile page
router.get('/',auth.isLoggedIn, async (req, res) => { 
    const user = req.session.user
    console.log(req.session.user.userId)
    const watchlistCount = await Watchlist.getWatchListCount(req.session.user.userId)
    const watchedCount = await Watchlist.getWatchedCount(req.session.user.userId)
    const reviewCount = await Review.getreviewCountbyuserID(req.session.user.userId)
    console.log(watchlistCount)
    res.render('profile',{user:user,watchlistCount: watchlistCount,watchedCount: watchedCount,reviewCount:reviewCount});
});

//Render profile edit page
router.get('/edit',auth.isLoggedIn,(req, res) => { 
    const user = req.session.user
    res.render('editprofile',{user:user,error:""});
});

// Route to POST the profile edit
router.post("/edit", profileController.editUser);

// Route to logout
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.send('Error logging out');
    }
    res.redirect('/login');
  });
});

module.exports = router;

