const express = require('express');
const router = express.Router();


const Watchlist = require('../models/watchlist-model')

const showMovieList = async (req,res) => {
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

const markAsWatched = async (req,res) => {
    try {
        const movieId = req.body.movieId;
        const user = await Watchlist.findOne({userId:req.session.user.userId})


        await Watchlist.findOneAndUpdate(
            {userId: req.session.user.userId, movieId: movieId},
            {hasWatched: true, whatchedDate: new Date()},
            {upsert: true}
        )
        console.log('Successfully marked')
        return res.redirect('/movie')
    } catch (error) {
        console.log(error);
        res.status(500).send('Error to mark movie as watched');
    };
};

const markAsUnwatched = async (req,res) => {
    try {
        const movieId = req.body.movieId;
        const user = await Watchlist.findOne({userId: req.session.user.userId})
            
        await Watchlist.updateOne(
            {userId: req.session.user.userId, movieId: movieId},
            {hasWatched: false, watchedDate: null}
        )
        
        console.log('Successfully unmarked')
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