const mongoose = require('mongoose')

// Defining Schema
const userModel = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'User must have a name']
    },
    email: {
        type: String,
        required: [true, 'User must have an email']
    },
    password: {
        type: String,
        required: [true, 'User must have a password']
    }

})

// Model Creation
const User = mongoose.model('User', userModel, 'user-auth')

module.exports = User