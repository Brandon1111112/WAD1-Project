# IAMdb — Movie Database Web Application

A full-stack movie database web application built with **Node.js**, **Express**, **EJS**, and **MongoDB**. Users can browse movies, write reviews, manage a personal watchlist, and receive personalised movie recommendations.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Setup](#setup)
3. [Running the Application](#running-the-application)
4. [Test Credentials](#test-credentials)
5. [User Roles](#user-roles)
6. [Route Overview](#route-overview)
7. [Project Structure](#project-structure)

---

## Prerequisites

Make sure the following are installed on your machine before proceeding:

- **Node.js** v18 or later — [https://nodejs.org](https://nodejs.org)
- **npm** (comes bundled with Node.js)
- A **MongoDB Atlas** account, or a local MongoDB instance

---

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/Brandon1111112/WAD1-Project.git
cd WAD1-Project
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a file named `config.env` in the root of the project with the following contents:

```env
DB=your_mongodb_connection_string_here
SECRET=your_session_secret_here
OMDB_API_KEY=your_omdb_api_key_here
```

| Variable | Description |
|---|---|
| `DB` | Your MongoDB connection URI (e.g. a MongoDB Atlas connection string) |
| `SECRET` | A long random string used to sign session cookies |
| `OMDB_API_KEY` | API key from [https://www.omdbapi.com](https://www.omdbapi.com) used for fetching movie data |

> **Note:** The `config.env` file is listed in `.gitignore` and should never be committed to version control.

---

## Running the Application

Start the server with:

```bash
node server.js
```

The application will be available at:

```
http://localhost:8000
```

The server will first connect to MongoDB, then start listening. You should see the following in your terminal on successful startup:

```
MongoDB connected successfully
Server running at http://localhost:8000/
```

---

## Test Credentials

| Role | Email | Password |
|---|---|---|
| Regular User | `user@test.com` | `password123` |
| Admin | `admin@test.com` | `adminpass123` |
| Super Admin | `superadmin@test.com` | `superpass123` |

To create an admin account manually, register a normal account first, then use the admin panel to promote the user via **Make Admin**. 

**Note**: Only a superAdmin can perform the initial promotion. Once the first admin is created, existing admins can promote other users to admin.

To create a superAdmin must have direct access to database they are supposed to be defined in the beginning directly editing and adding in the Boolean statement for superAdmin:true

---

## User Roles

The application has four levels of access:

| Role | Access |
|---|---|
| **Guest** | Can browse movies and homepage |
| **User** | Can browse movies, write and manage their own reviews, manage their watchlist, view recommendations, and edit their profile |
| **Admin** | All user permissions, plus access to the admin panel: view all users, create new user accounts, promote users to admin, and delete users |
| **Super Admin** | — Intended to have elevated permissions above admin, such as managing admin accounts |

When a user with `admin: true` logs in, they are automatically redirected to `/admin` instead of `/`.

---

## Route Overview

### Authentication — `/login`, `/register`

| Method | Path | Description |
|---|---|---|
| GET | `/login` | Renders the login page |
| POST | `/login` | Validates credentials and creates a session. Admins are redirected to `/admin`, regular users to `/` |
| GET | `/register` | Renders the registration page |
| POST | `/register` | Creates a new user account and redirects to login |

---

### Home — `/`

| Method | Path | Description |
|---|---|---|
| GET | `/` | Renders the landing page. |

---

### Movies — `/movie`

| Method | Path | Description |
|---|---|---|
| GET | `/movie` | Lists all movies in the database. Requires login |
| GET | `/movie/create` | Renders the form to add a new movie |
| POST | `/movie/create` | Saves a new movie to the database |
| GET | `/movie/:id` | Shows the detail page for a specific movie, including reviews. Requires login |
| GET | `/movie/edit/:id` | Renders the form to edit an existing movie |
| POST | `/movie/edit/:id` | Saves the updated movie details |
| GET | `/movie/delete/:id` | Renders a delete confirmation page for a movie |
| POST | `/movie/delete/:id` | Permanently deletes the movie from the database |

#### Reviews (nested under `/movie`)

| Method | Path | Description |
|---|---|---|
| POST | `/movie/:id/review` | Submits a new review for a movie. Requires login |
| GET | `/movie/review/edit/:reviewId` | Renders the form to edit an existing review. Requires login |
| POST | `/movie/review/edit/:reviewId` | Saves the updated review |
| POST | `/movie/review/delete/:reviewId` | Deletes a review. Requires login |

---

### Watchlist & Watched Movies — `/watched`

| Method | Path | Description |
|---|---|---|
| GET | `/watchlist` | Displays the user's watchlist and already-watched movies. Requires login |
| POST | `/watchlist/add` | Adds a movie to the user's watchlist |
| POST | `/watchlist/remove` | Removes a movie from the user's watchlist |
| POST | `/watchlist/watch` | Marks a movie as watched |
| POST | `/watchlist/unwatch` | Unmarks a movie as watched |
| GET | `/watchlist/recommended` | Displays personalised movie recommendations based on the user's watch history and/or favourite genre (optional in profile page) |

---

### Profile — `/profile`

| Method | Path | Description |
|---|---|---|
| GET | `/profile` | Renders the user's profile page. Requires login |
| GET | `/profile/edit` | Renders the profile edit form. Requires login |
| POST | `/profile/edit` | Saves the updated profile details (name, email, password) |
| GET | `/profile/logout` | Destroys the session and redirects to `/login` |

---

### Admin Panel — `/admin`

All admin routes require the user to be logged in and have `admin: true`. Non-admins are redirected to `/`.

| Method | Path | Description |
|---|---|---|
| GET | `/admin` | Renders the admin dashboard with a table of all registered users |
| GET | `/admin/create-user` | Renders the form to create a new user account |
| POST | `/admin/create-user` | Creates a new user in the database |
| POST | `/admin/confirm-delete` | Shows a confirmation page listing users selected for deletion |
| POST | `/admin/delete-users` | Permanently deletes the selected users from the database |
| POST | `/admin/make-admin` | Promotes a user to admin by setting their `admin` flag to `true` |
| GET | `/logs/:userID` | Shows the history logs of the user selected in the admin panel |

---

## Project Structure

```
WAD1-Project/
├── controllers/         # Business logic for each feature
│   ├── adminController.js
│   ├── discussionboardController.js
│   ├── discussionboardreplyController.js
│   ├── movieController.js
│   ├── userController.js
│   ├── reviewController.js
│   ├── watchedMovieController.js
│   └── utils/
│       └── validation.js
├── middlewares/
│   └── auth-middleware.js   # isLoggedIn and isAdmin guards
├── models/
│   ├── discussionboard-model.js
│   ├── discussionboardreply-model.js
│   ├── logs-model.js
│   ├── movie-model.js
│   ├── review-model.js
│   ├── user-model.js
│   └── watchlist-model.js
├── public/
│   ├── style.css
│   └── img/
├── routes/
│   ├── adminRoutes.js
│   ├── discussionBoardRoutes.js
│   ├── movieRoutes.js
│   ├── userRoutes.js
│   └── watchedMoviesRoutes.js
├── views/
│   ├── partials/
│   │   └── navbar.ejs
│   ├── admin-delete-confirmation.ejs
│   ├── admin-home.ejs
│   ├── admin-status-success.ejs
│   ├── all-movies.ejs
│   ├── create-movie.ejs
│   ├── create-user.ejs
│   ├── delete-success.ejs
│   ├── discussionboard-delete.ejs
│   ├── discussionboard-deletesuccess.ejs
│   ├── discussionboard-replies-delete.ejs
│   ├── discussionboard-replies-deletesuccess.ejs
│   ├── discussionboard-replies-update.ejs
│   ├── discussionboard-replies.ejs
│   ├── discussionboard-update.ejs
│   ├── discussionboard.ejs
│   ├── edit-movie.ejs
│   ├── edit-review.ejs
│   ├── edit-profile.ejs
│   ├── error.ejs
│   ├── home.ejs
│   ├── login.ejs
│   ├── logs.ejs
│   ├── movie-delete.ejs
│   ├── movie.ejs
│   ├── profile.ejs
│   ├── recommendations.ejs
│   ├── register.ejs
│   ├── user-delete-confirmation.ejs
│   └── wathcedMovies.ejs
├── server.js            # Entry point — connects to MongoDB and starts Express
├── config.env           # Environment variables (not committed to Git)
└── package.json
```

---

## Notes
- The `OMDB_API_KEY` is used to fetch external movie metadata. A free key can be obtained at [https://www.omdbapi.com/apikey.aspx](https://www.omdbapi.com/apikey.aspx).