const fs = require('fs/promises')

const express = require('express');
const router = express.Router();
const User = require('../models/user-model.js')

router.get('/', async (req, res) => { //Render admin page
    const users = await User.find();
    console.log(users);
    res.render('admin',{Users:users});
    
});


module.exports = router;