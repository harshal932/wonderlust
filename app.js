if(process.env.NODE_ENV != "production"){
    require("dotenv").config();
}
// console.log(process.env.SECRet);
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const listingsRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const Review = require("./models/review.js");
const User = require("./models/user.js");
// const session=require("express-session");
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");

// MongoDB connection
const dbUrl= process.env.ATLASDB_URL;

async function main() {
    await mongoose.connect(dbUrl);
}
main()
    .then(() => console.log("Connected to DB"))
    .catch(err => console.log(err));

// View Engine Setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));


const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto:{
        secret: process.env.SECRET,
    },
    touchAfter: 24*3600,
});
store.on("error",(err)=>{
    console.log("Error in mongo session store",err);
})

const sessionOptions={
    store,
    secret:process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie:{
        expires: Date.now()+7*24*60*60*1000,
        maxAge: 7*24*60*60*1000,
        httpOnly: true
    }
}
// Root Route
app.get("/", (req, res) => {
    res.redirect("/listings");
});

app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser=req.user;
    next();
})

// app.get("/demouser", async(req, res) => {
//     // const user = new User({ username: "demoUser" });
//     // const newUser = await User.register(user, "demoPassword");
//     // res.send(newUser);
//     let fakeUser= new User({
//         email:"stu@gmaiil.com",
//         username:"delta-student"
//     });
//     let registeredUser = User.register(fakeUser,"deltaPassword")
//     res.send(registeredUser);
// });

app.use("/listings", listingsRouter);
app.use("/listings", reviewRouter);
app.use("/",userRouter);
//Page not found route
app.use((req, res, next) => {
    next(new ExpressError(404, "Page not found"));
});

//For the custom error handling middleware
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong" } = err;
    console.log("ERROR_HANDLER", req.originalUrl, statusCode, message);
    if (res.headersSent) {
        return next(err);
    }
    res.status(statusCode).render("listings/error", { err });
});


// Server Start
app.listen(8080, () => {
    console.log("Server running on port 8080");
});