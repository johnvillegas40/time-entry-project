var express         = require("express");
var router          = express.Router();
var passport        = require("passport");
var User            = require("../models/user");
var middleware = require("../middleware/index");
var home = require("../routes/home")
//=================================================
// Landing
//=================================================
// root route
router.get("/", function(req, res) {
    res.render("landing");
});

router.get("/register", function(req, res) {
    res.render("register");
});



//handle sign up logic
router.post("/register", middleware.usernameToLowerCase, function(req, res) {
    var newUser = new User({firstName: req.body.firstName, lastName: req.body.lastName, email: req.body.email, username: req.body.username, dob: req.body.dob,});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            if(err.name === 'UserExistsError') {
                req.flash("registererror", "User already exists.");
                return res.redirect("/register");
            } else {
                return res.redirect("/register");
            }
            
        }
        passport.authenticate("local")(req, res, function(){
            console.log(req.body.username + " has just signed up!");
            req.flash("joining", "Thanks for joining!");
            res.redirect("/home");
        });
    });
});


//show login form

router.get("/login", function(req, res) {
    res.render("login");
});

// handling login logic
router.post("/login", middleware.usernameToLowerCase, passport.authenticate("local", {
    successRedirect: "/home",
    failureRedirect: "/login",
    failureFlash: ("error","Incorrect Username or Password.")
}), function(req, res) {
});



// logout route
router.get("/logout", middleware.isLoggedIn, function(req, res) {
   console.log(req.user.username + " has logged out!");
   req.logout();
   req.flash("regular", "Logged you out!"); 
   res.redirect("/");
});


//404


module.exports = router;