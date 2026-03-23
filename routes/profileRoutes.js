const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth-middleware')
const profileController = require("../controllers/profileController");

//Render profile page
router.get('/',auth.isLoggedIn,(req, res) => { 
    const user = req.session.user
    res.render('profile',{user:user});
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

