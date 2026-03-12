const express = require("express");
const router = express.Router();
const movieController = require("../controllers/movieController");

router.get("/", async (req, res) => {
  const movies = await movieController.getAllMovies(req, res);
  res.render("all-movies", { movies: movies });
});

router.get("/create", (req, res) => {
  res.render("create-movie.ejs");
});

router.post("/create", (req, res) => {
  movieController.createMovie(req, res);
  res.render("create-movie");
});

router.get("/:id", async (req, res) => {
  const movie = await movieController.getMovieById(req, res);
  console.log(movie)
  res.render("movie", { movie: movie });
});

module.exports = router;
