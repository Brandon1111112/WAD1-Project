const express = require("express");
const router = express.Router();

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

module.exports = router;