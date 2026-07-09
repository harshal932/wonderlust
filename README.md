# 🌍 Wanderlust

A full-stack property listing web app built with **Node.js**, **Express**, **MongoDB**, and **EJS** — similar to Airbnb.

---

## 🚀 Getting Started

### Prerequisites
Make sure you have these installed on your computer:
- [Node.js](https://nodejs.org/) (v18 or above)
- [MongoDB](https://www.mongodb.com/try/download/community) (running locally)

### Installation

```bash
# 1. Clone or download this project

# 2. Install all dependencies
npm install

# 3. Make sure MongoDB is running on your machine

# 4. Start the server
node app.js
```

Then open your browser and go to: **http://localhost:8080**

---

## 📁 Project Structure

```
Project/
├── app.js              ← Main server file (entry point)
├── schema.js           ← Joi validation schema
├── package.json        ← Project info & dependencies
│
├── models/
│   └── listing.js      ← Mongoose model (database blueprint)
│
├── utils/
│   ├── wrapAsync.js    ← Catches async errors safely
│   └── ExpressError.js ← Custom error class
│
├── views/
│   ├── layouts/
│   │   └── boilerplate.ejs  ← Shared HTML layout (navbar, footer)
│   ├── includes/
│   │   └── navbar.ejs       ← Navbar component
│   └── listings/
│       ├── index.ejs   ← Show ALL listings
│       ├── show.ejs    ← Show ONE listing
│       ├── new.ejs     ← Form to CREATE a listing
│       ├── edit.ejs    ← Form to EDIT a listing
│       └── error.ejs   ← Error page
│
├── public/
│   └── css/
│       └── style.css   ← Custom styles
│
└── init/               ← Seed data for database
```

---

## 🛣️ Routes (API Endpoints)

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/` | Home / Root page |
| GET | `/listings` | Show all listings |
| GET | `/listings/new` | Form to create a new listing |
| POST | `/listings` | Save new listing to database |
| GET | `/listings/:id` | Show a single listing |
| GET | `/listings/:id/edit` | Form to edit a listing |
| PUT | `/listings/:id` | Update a listing in database |
| DELETE | `/listings/:id` | Delete a listing |

---

## 🧱 Tech Stack

| Technology | Purpose |
|------------|---------|
| **Express.js** | Web server & routing |
| **MongoDB** | Database (stores listings) |
| **Mongoose** | Talk to MongoDB from Node.js |
| **EJS** | HTML templating (dynamic pages) |
| **ejs-mate** | Shared layout for all pages |
| **method-override** | Allows PUT & DELETE from HTML forms |
| **Joi** | Form data validation |
| **Bootstrap** | CSS styling & components |

---

## 🔄 How It Works (Flow)

```
User visits http://localhost:8080/listings
        ↓
Express receives the GET /listings request
        ↓
Middleware runs (parse body, serve static files)
        ↓
Route matches: app.get("/listings", ...)
        ↓
MongoDB query: Listing.find({}) → fetches all listings
        ↓
res.render("listings/index", { allListings })
        ↓
Browser displays the listings page
```

---

## 📦 Dependencies

```json
{
  "express"       : "Web framework",
  "mongoose"      : "MongoDB ODM",
  "ejs"           : "Template engine",
  "ejs-mate"      : "EJS layout support",
  "method-override": "PUT/DELETE in HTML forms",
  "joi"           : "Validation library",
  "@faker-js/faker": "Generate fake seed data"
}
```

Install all at once:
```bash
npm install
```

---

## ⚠️ Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `MongooseError: connect ECONNREFUSED` | MongoDB not running | Start MongoDB service |
| `Cannot GET /listings` | Server not started | Run `node app.js` |
| `Validation error` | Form fields are empty | Fill all required fields |
| `Listing not found` | Wrong/deleted ID in URL | Go back to `/listings` |

---

## 📄 `app.js` — Full Code Explained

This is the **heart** of the project. Every line is explained below.

```js
// ─────────────────────────────────────────────
// STEP 1: Import all required packages (tools)
// ─────────────────────────────────────────────
const express = require("express");          // Web framework to create the server
const app = express();                       // Create the Express app instance
const mongoose = require("mongoose");        // Tool to connect & work with MongoDB
const Listing = require("./models/listing.js"); // Our database model (blueprint)
const path = require("path");                // Node.js built-in: work with file paths
const methodOverride = require("method-override"); // Allow PUT/DELETE from HTML forms
const ejsMate = require("ejs-mate");         // Use shared layout for EJS views
const wrapAsync = require("./utils/wrapAsync.js");   // Safely handle async errors
const ExpressError = require("./utils/ExpressError.js"); // Custom error class
const { listingSchema } = require("./schema.js"); // Joi validation schema

// ─────────────────────────────────────────────
// STEP 2: Connect to MongoDB Database
// ─────────────────────────────────────────────
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
// 127.0.0.1 = your own computer (localhost)
// 27017     = default MongoDB port
// wanderlust = name of our database

async function main() {
    await mongoose.connect(MONGO_URL); // Wait until connected
}
main()
    .then(() => console.log("Connected to DB")) // ✅ Success
    .catch(err => console.log(err));            // ❌ Log error if failed

// ─────────────────────────────────────────────
// STEP 3: Configure the View Engine (EJS)
// ─────────────────────────────────────────────
app.set("view engine", "ejs");                      // Tell Express to use EJS
app.set("views", path.join(__dirname, "views"));    // Look for views in /views folder
app.engine("ejs", ejsMate);                         // Use ejs-mate for shared layouts

// ─────────────────────────────────────────────
// STEP 4: Middleware (runs on EVERY request)
// ─────────────────────────────────────────────
app.use(express.urlencoded({ extended: true }));    // Read HTML form data
app.use(methodOverride("_method"));                 // Support PUT & DELETE via forms
app.use(express.static(path.join(__dirname, "public"))); // Serve CSS, images, JS

// ─────────────────────────────────────────────
// STEP 5: Root Route
// ─────────────────────────────────────────────
app.get("/", (req, res) => {
    res.send("Hi, I am root"); // Just sends plain text for now
});

// ─────────────────────────────────────────────
// STEP 6: Validation Middleware
// Runs before CREATE and UPDATE to check form data
// ─────────────────────────────────────────────
const validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body); // Check form data with Joi
    if (error) {
        // If invalid → collect all error messages and throw an error
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next(); // ✅ Valid → move to the next function (save to DB)
    }
};

// ─────────────────────────────────────────────
// STEP 7: ROUTES (CRUD Operations)
// ─────────────────────────────────────────────

// INDEX — Show ALL listings
app.get("/listings", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({}); // Get every listing from MongoDB
    res.render("listings/index", { allListings }); // Send to index.ejs
}));

// NEW — Show form to create a listing
app.get("/listings/new", (req, res) => {
    res.render("listings/new"); // Just show the empty form
});

// CREATE — Save new listing (with validation)
app.post("/listings", validateListing, wrapAsync(async (req, res) => {
    const newListing = new Listing(req.body.listing); // Create listing object
    await newListing.save();                           // Save to MongoDB
    res.redirect("/listings");                         // Go back to all listings
}));

// SHOW — Show ONE specific listing by ID
app.get("/listings/:id", wrapAsync(async (req, res) => {
    const { id } = req.params;                  // Get :id from the URL
    const listing = await Listing.findById(id); // Find in MongoDB by ID
    if (!listing) {
        throw new ExpressError(404, "Listing not found"); // Not found → error
    }
    res.render("listings/show", { listing });   // Send to show.ejs
}));

// EDIT — Show form pre-filled with existing data
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id); // Load existing data
    res.render("listings/edit", { listing });    // Show edit form with data
}));

// UPDATE — Save the edited data (with validation)
app.put("/listings/:id", validateListing, wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing }); // Update in DB
    res.redirect(`/listings/${id}`);            // Go to updated listing page
}));

// DELETE — Remove a listing
app.delete("/listings/:id", wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id); // Delete from MongoDB
    res.redirect("/listings");           // Go back to all listings
}));

// ─────────────────────────────────────────────
// STEP 8: 404 — Page Not Found Handler
// If NO route above matched, this runs
// ─────────────────────────────────────────────
app.use((req, res, next) => {
    next(new ExpressError(404, "Page not found"));
});

// ─────────────────────────────────────────────
// STEP 9: Global Error Handler
// Catches ALL errors thrown anywhere in the app
// Note: 4 parameters = Express knows this is error handler
// ─────────────────────────────────────────────
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).render("error.ejs", { err }); // Show error page
});

// ─────────────────────────────────────────────
// STEP 10: Start the Server
// ─────────────────────────────────────────────
app.listen(8080, () => {
    console.log("Server running on port 8080");
    // Visit: http://localhost:8080
});
```

---

## 👨‍💻 Author

Built while learning full-stack web development at **Apna College**.

---

## 📝 License

This project is for learning purposes only.
