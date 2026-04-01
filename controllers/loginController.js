const bcrypt = require('bcrypt');
//Get Model
const Logs = require('../models/logs-model');
const User = require('../models/user-model');

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
        if (user.admin === true){
            return res.redirect('/admin')
        }
        res.redirect('/')
       
    // catch any error and render login page with error message
    } catch (error) {
        res.render('login', { error: "Server error" })
    }
}