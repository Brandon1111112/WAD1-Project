const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth-middleware')
router.get('/',auth.isLoggedIn,(req, res) => { //Render register page
    const user = req.session.user
    console.log(req.session.user.profilePic)
    res.render('profile',{user:user});
});

module.exports = router;