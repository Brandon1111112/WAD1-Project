const express = require("express");
const router = express.Router();
const movieController = require("../controllers/movieController");
const auth = require('../middlewares/auth-middleware')

//Route to GET all movie objects
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
