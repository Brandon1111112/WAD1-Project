const express = require('express');

const {registerUser} = require("../controllers/registerController");
const router = express.Router();

router.get('/', (req, res) => { //Render register page
    res.render('register',{error: null});
});

router.post('/',registerUser) //Handle register form submission
module.exports = router;