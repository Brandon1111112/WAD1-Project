const express = require("express");
const router = express.Router();
const movieController = require("../controllers/movieController");
const movies = {
  test1: {
    title: "Movie 1",
    description: "First movie description",
  },
  test2: {
    title: "Movie 2",
    description: "Second movie description",
  },
  test3: {
    title: "Movie 3",
    description: "Third movie description",
  },
};

router.get("/", async (req, res) => {
  const movies = await movieController.getAllMovies(req, res);
  console.log(movies)
  res.render("all-movies", { movies: movies });
});

router.get("/create", (req, res) => {
  res.render("create-movie.ejs");
});

router.post("/create", (req, res) => {
  movieController.createMovie(req, res);
  res.render("create-movie");
});

router.get("/:id", (req, res) => {
  const movie = movies[req.params.id];
  if (!movie) {
    return res.send("Movie not found");
  }
  res.render("movie", { movie });
});

module.exports = router;
