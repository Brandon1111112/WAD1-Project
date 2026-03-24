const express = require('express');
const router = express.Router();

const Movie = require('../models/movie-model')
const Watchlist = require('../models/watchlist-model')

const showWatchlist = async (req,res) => {
    try{
        const watchlist = await Watchlist.find(
            {userId:req.session.user.userId, wantsToWatch: true, hasWatched: false}
        ).populate('movieId');

        const alreadyWatched = await Watchlist.find(
            {userId:req.session.user.userId, wantsToWatch: false, hasWatched: true}
        ).populate('movieId')

        return res.render('watchedMovies', {watchlist, alreadyWatched})

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
            {wantsToWatch: true, hasWatched: false, watchedDate: new Date()},
            {upsert: true}
        )
        console.log('Successfully added to watchlist')
        return res.redirect(req.headers.referer || '/movie')
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
            {wantsToWatch: false, watchedDate: null}
        )
        
        console.log('Successfully removed from watchlist');
        return res.redirect(req.headers.referer || '/movie')
    } catch (error) {
        console.log(error);
        res.status(500).send('Error to mark movie as unwatched');
    }
}

const showRecommendations = async (req,res) => {
    try {
        const watched = await Watchlist.find({
            userId: req.session.user.userId,
            hasWatched: true,
        }).populate('movieId');

        // count genres
        const genreCount = {};
        watched.forEach(entry => {
            const genre = entry.movieId.genre;
            genreCount[genre] = (genreCount[genre] || 0) + 1;
        });

        // find top 3 genres
        const topGenres = Object.keys(genreCount)
            .sort((a,b) => genreCount[b] - genreCount[a])
            .slice(0,3);

        // find movies not yet watched
        const watchedMovies = watched.map(entry => entry.movieId._id);
        const recommendations = await Movie.getMoviesByGenres(topGenres, watchedMovies)

        res.render('recommendations', {recommendations, topGenres})
    } catch (error) {
        console.log(error);
        res.status(500).send('Error showing reccomendation');
    }
    
}   

module.exports = {
    showWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    showRecommendations
}