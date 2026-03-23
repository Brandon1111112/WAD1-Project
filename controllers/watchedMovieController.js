const express = require('express');
const router = express.Router();


const Watchlist = require('../models/watchlist-model')

const showWatchlist = async (req,res) => {
    try{
        const watchlist = await Watchlist.find(
            {userId:req.session.user.userId, hasWatched: true}
        ).populate('movieId');

        return res.render('watchedMovies', {watchedMovies: watchlist})

    } catch (error) {
        console.log(error);
        res.status(500).send('Error to fetch movies watched');
    }
};

const addToWatchlist = async (req,res) => {
    try {
        const movieId = req.body.movieId;

        await Watchlist.findOneAndUpdate(
            {userId: req.session.user.userId, movieId: movieId},
            {hasWatched: true, watchedDate: new Date()},
            {upsert: true}
        )
        console.log('Successfully added to watchlist')
        return res.redirect('/movie')
    } catch (error) {
        console.log(error);
        res.status(500).send('Error to mark movie as watched');
    };
};

const removeFromWatchlist = async (req,res) => {
    try {
        const movieId = req.body.movieId;

        await Watchlist.updateOne(
            {userId: req.session.user.userId, movieId: movieId},
            {hasWatched: false, watchedDate: null}
        )
        
        console.log('Successfully removed from watchlist')
        return res.redirect('/movie')
    } catch (error) {
        console.log(error);
        res.status(500).send('Error to mark movie as unwatched');
    }
}

module.exports = {
    showWatchlist,
    addToWatchlist,
    removeFromWatchlist
}