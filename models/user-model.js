const mongoose = require('mongoose')

// Defining User Schema
const userModel = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'User must have a name']
    },
    email: {
        type: String,
        required: [true, 'User must have an email'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'User must have a password']
    },
    admin: {
        type: Boolean,
        required: [false, 'User does not have to be an admin'] //removed [false, 'User does not have to be an admin'] as it would never be displayed because optional
    },
    profilePic: {
        type: String,
        default: '/img/default-profile.jpg' // fallback image
    }
})

// Model Creation
const User = mongoose.model('User', userModel, 'user-auth')

module.exports = User