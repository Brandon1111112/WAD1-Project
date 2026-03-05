const express = require('express');

const {loginUser} = require("../controllers/loginController");
const router = express.Router();

router.get('/', (req, res) => { //Render login page
    res.render('login',{error: null});
});

router.post('/',loginUser) //Handle login form submission
module.exports = router;