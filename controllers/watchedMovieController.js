const express = require('express');
const router = express.Router();
const Movie = require("../models/movie-model");
const User = require('../models/user-model');

const showMovieList = async (req,res) => {
    try{
        const user = await User.findOne({ email: req.session.user.userId }).populate('watchedMovies.movieId');

        return res.render('watchedMovies', {watchedMovies: user.watchedMovies})

    } catch (error) {
        console.log(error);
        res.status(500).send('Error to fetch movies watched');
    }
};

const markAsWatched = async (req,res) => {
    try {
        const movieId = req.body.movieId;
        const user = await User.findOne({ email: req.session.user.userId });
        
        if (!user.watchedMovies.includes(movieId)){
            user.watchedMovies.push({
                movieId: movieId,
                watchedAt: new Date()
            });
            await user.save();
        }
        return res.redirect('/movie')
    } catch (error) {
        console.log(error);
        res.status(500).send('Error to mark movie as watched');
    };
};

const markAsUnwatched = async (req,res) => {
    try {
        const movieId = req.body.movieId;
        const user = await User.findOne({ email: req.session.user.userId });
            
        user.watchedMovies = user.watchedMovies.filter(
            entry => entry.movieId.toString() !== movieId
        );
            
        await user.save();
        return res.redirect('/movie')
    } catch (error) {
        console.log(error);
        res.status(500).send('Error to mark movie as unwatched');
    }
}

module.exports = {
    showMovieList,
    markAsWatched,
    markAsUnwatched
}