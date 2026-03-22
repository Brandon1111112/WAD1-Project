const mongoose = require('mongoose')

// Defining Sub-Schema for keeping track of movies watched based on the user
const watchedEntrySchema = new mongoose.Schema({
    movieId: {type: mongoose.Schema.Types.ObjectId, ref:'Movie'},
    watchedAt: {type: Date, default: Date.now}
}, {_id: false});
// Defining Schema
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
    watchedMovies: {
        type: [watchedEntrySchema],
        default: [],
        required: false
    },

})

// Model Creation
const User = mongoose.model('User', userModel, 'user-auth')

module.exports = User