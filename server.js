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
  next();
});

server.set("view engine", "ejs")

// Import route files
const loginRoutes = require('./routes/loginRoutes');
const registerRoutes = require('./routes/registerRoutes');
const homeRoutes = require('./routes/homeRoutes');
const adminRoutes = require('./routes/adminRoutes');
const viewuserRoutes = require('./routes/viewuserRoutes');
const movieRoutes = require('./routes/movieRoutes');
const watchedMovieRoutes = require('./routes/watchedMoviesRoutes');
const profileRoutes = require('./routes/profileRoutes.js');
const noticeBoardRoutes= require('./routes/noticeBoardRoutes.js')
// Use the routes
server.use('/login', loginRoutes);   // Login routes
server.use('/register', registerRoutes);  // Register routes
server.use('/home', homeRoutes);
server.use('/admin', adminRoutes); //admin Routes
server.use('/viewusers', viewuserRoutes); //Route for admins to view users Routes
server.use('/movie', movieRoutes);
server.use('/watched', watchedMovieRoutes); //Route for lisiting watched movies and recomandations
server.use('/profile', profileRoutes); // Route to profile page
server.use('/noticeboard',noticeBoardRoutes); // Route to Noticeboard



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
