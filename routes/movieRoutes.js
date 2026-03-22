const express = require("express");
const router = express.Router();
const movieController = require("../controllers/movieController");
const auth = require('../middlewares/auth-middleware')

const movies = {
    test1: {
        title: "Movie 1",
        description: "First movie description"
    },
    test2: {
        title: "Movie 2",
        description: "Second movie description"
    },
    test3: {
        title: "Movie 3",
        description: "Third movie description"
    }
};

router.get("/:id", (req, res) => {

    const movie = movies[req.params.id];

    if (!movie) {
        return res.send("Movie not found");
    }

    res.render("movie", { movie });
});

module.exports = router;//Route to GET all movie objects
router.get("/", auth.isLoggedIn, movieController.getAllMovies);

//Route to GET the create movie form
router.get("/create", movieController.getCreateMovieForm);

//Route to send a POST request to create a new movie object
router.post("/create", movieController.createMovie);

//Route to GET the movie to be deleted
router.get("/delete/:id", movieController.getMovieToBeDeleted);

//Route to send a POST request to delete the movie object
router.post("/delete/:id", movieController.deleteMovie);

//Route to GET the movie object to be edited
router.get("/edit/:id", movieController.getMovieToEdit);

//Route to send a POST request to edit the movie object
router.post("/edit/:id", movieController.updateMovieDetails);

//Route to GET a movie by it's ID
router.get("/:id", movieController.getMovieById);

module.exports = router;
