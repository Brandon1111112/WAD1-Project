const fs = require('fs/promises')

//Get Model
const User = require('../models/user-model')

//Data validation of Login details
exports.registerUser = async (req, res) => {
    const {name, email, password } = req.body
    try {
        const user = await User.findOne({ email })
        if (!user) {
            const newUser = new User({ // Create a new user if user not found
                name,
                email,
                password, 
            });
            await newUser.save()
            return res.redirect('/home')
        }
        else{
            console.log("Existing Account found")
            return res.render('register',{ error: "You have an existing account" })
        }
    } catch (err) {
        console.log("Server Error")
        res.render('register', { error: "Server error" })
    }
}