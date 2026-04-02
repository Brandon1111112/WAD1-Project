const express = require("express");
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const server = express();
const path = require("path");
const session = require('express-session')
require("node:dns/promises").setServers(["1.1.1.1", "8.8.8.8"]);

server.use("/", express.static(path.join(__dirname, "public")))

// Specify path to envrionment variable file 'config.env'
dotenv.config({ path: './config.env' })

// Parse URL-encoded data from POST requests
// Middlewares
server.use(express.urlencoded({ extended: true }));

//express.json() is a middleware
server.use(express.json())

// Set EJS as view engine for rendering dynamic HTML pages
const secret = process.env.SECRET; // get SECRET from config.env
server.use(session({
    secret,
    resave: false,
    saveUninitialized: false
}))

// Make user available in all views //Used to help with Navbar to show different for Admin versus Users on NavBar
server.use((req, res, next) => {
    res.locals.user = req.session.user;
    console.log('Session user:', req.session.user); // Debug line to check if user session being set correct
    next();
});

server.set("view engine", "ejs")

// Import route files
const userRoutes = require('./routes/userRoutes.js');
const adminRoutes = require('./routes/adminRoutes');
const movieRoutes = require('./routes/movieRoutes');
const watchedMovieRoutes = require('./routes/watchedMoviesRoutes');
const noticeBoardRoutes = require('./routes/noticeBoardRoutes.js')

// Use the routes
server.use('/', userRoutes);   // Login routes
server.use('/admin', adminRoutes); // Admin Routes
server.use('/movie', movieRoutes); // Route for visiting movie page
server.use('/watchlist', watchedMovieRoutes); // Route for lisiting watched movies and recomandations
server.use('/noticeboard', noticeBoardRoutes); // Route to Noticeboard

// Route for wrong URL
server.use((req, res) => {
    res.status(404).render("error", {
        error: "Invalid URI",
        statusCode: 404
    });
});

// async function to connect to DB
async function connectDB() {
    try {
        await mongoose.connect(process.env.DB)
        console.log("MongoDB connected successfully")
    }
    catch (error) {
        console.log("MongoDB connection failed:", error.message)
        process.exit(1)
    }
}

function startServer() {
    const hostname = "localhost";
    const port = 8000;

    server.listen(port, hostname, () => {
        console.log(`Server running at http://${hostname}:${port}/`);
    });

}
// Try connecting DB first before starting web server
connectDB().then(startServer)
