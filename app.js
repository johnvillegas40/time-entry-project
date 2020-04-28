//==================================================================
// Package Requires
//==================================================================
var express = require("express"),
  app = express(),
  bodyParser = require("body-parser"),
  mongoose = require("mongoose"),
  passport = require("passport"),
  LocalStrategy = require("passport-local"),
  methodOverride = require("method-override"),
  passportLocalMongoose = require("passport-local-mongoose"),
  flash = require("connect-flash"),
  User = require("./models/user");

//requiring routes
var indexRoutes = require("./routes/index.js"),
  homeRoutes = require("./routes/home");

//==================================================================
// Mongoose/Body Parser/ View Engine
//==================================================================

mongoose.connect(
  "mongodb://dbwrite:dbwrite1@ds263638.mlab.com:63638/fwatimeentry-dev"
);
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());

//==================================================================
// Passport Setup
//==================================================================

app.use(
  require("express-session")({
    secret:
      "Rachel is the cutiest cutie in the whole wide world, like seriously.",
    resave: false,
    saveUninitialized: false
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.regularMessage = req.flash("regular");
  res.locals.error = req.flash("error");
  res.locals.joining = req.flash("joining");
  next();
});

//==================================================================
// Router Uses
//==================================================================
app.use("/", indexRoutes);
app.use("/home", homeRoutes);

//==================================================================
// APP.LISTEN Route
//==================================================================
// process.env.PORT
app.listen(process.env.PORT || 5213, process.env.IP, function() {
  console.log("***The Time Tracking Application has Started on port 5213.***");
});
