const express = require("express");
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const server = express();
const path = require("path");

server.use("/", express.static(path.join(__dirname, "public")))

// Specify path to envrionment variable file 'config.env'
dotenv.config({ path: './config.env'})

// Parse URL-encoded data from POST requests
server.use(express.urlencoded({ extended: true }));

//express.json() is a middleware
server.use(express.json())

// Set EJS as view engine for rendering dynamic HTML pages
server.set("view engine", "ejs")

// Import route files
const loginRoutes = require('./routes/loginRoutes');
const registerRoutes = require('./routes/registerRoutes');
const indexRoutes = require('./routes/indexRoutes');
const homeRoutes = require('./routes/homeRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Use the routes
server.use('/login', loginRoutes);   // Login routes
server.use('/register', registerRoutes);  // Register routes
server.use('/index', indexRoutes);  // Index routes
server.use('/home', homeRoutes);
server.use('/admin', adminRoutes); //admin Routes




// async function to connect to DB
async function connectDB(){
    try{
        await mongoose.connect(process.env.DB)
        console.log("MongoDB connected successfully")
    }
    catch(error){
        console.log("MongoDB connection failed:", error.message)
        process.exit(1)
    }
}

function startServer(){
    const hostname = "localhost";
    const port = 8000;

    server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
    });

}

// Try connecting DB first before starting web server
connectDB().then(startServer)
