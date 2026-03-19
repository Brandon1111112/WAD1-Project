const express = require("express");
const router = express.Router();
const movieController = require("../controllers/movieController");

router.get("/", movieController.getAllMovies);

router.get("/create", movieController.getCreateMovieForm);

router.post("/create", movieController.createMovie);

router.get("/delete/:id", movieController.getMovieToBeDeleted);

router.post("/delete/:id", movieController.deleteMovie);

router.get("/edit/:id", movieController.getMovieToEdit);

router.post("/edit/:id", movieController.updateMovieDetails);

router.get("/:id", movieController.getMovieById);

module.exports = router;
