const fs = require('fs/promises')
const bcrypt = require('bcrypt');
//Get Model
const User = require('../models/user-model')

//Data validation of Login details
exports.loginUser = async (req, res) => {
    const { email, password } = req.body
    try {
        //Check if email exists in database
        const user = await User.findOne({ email })

        //If email not found, render login page with error message
        if (!user) {
            return res.render('login', { error: "Email not found" })
        }
        //Compare password with hashed password in database
        const match = await bcrypt.compare(password, user.password); // user is undefined if email not valid
        
        //If password does not match, render login page with error message
        if (!match) {
            return res.render('login', { error: "Wrong password" })
        }

        //Initialise session with user infos if successful login
        req.session.user = {
            userId: user._id,
            admin: user.admin,
            superAdmin: user.superAdmin
        }

        //If user is admin, redirect to admin page, else redirect to home page
        if (user.admin === true){
            return res.redirect('/admin')
        }
        res.redirect('/')
       
    // catch any error and render login page with error message
    } catch (error) {
        res.render('login', { error: "Server error" })
    }
}