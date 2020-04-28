var express         = require("express");
var router          = express.Router();
var passport        = require("passport");
var User            = require("../models/user");
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
router.post("/register", function(req, res) {
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            return res.render("register");
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
router.post("/login", passport.authenticate("local", {
    successRedirect: "/home",
    failureRedirect: "/login",
    failureFlash: ("error", "Username/Password incorrect.")
}), function(req, res) {
});


// logout route
router.get("/logout", isLoggedIn, function(req, res) {
   console.log(req.user.username + " has logged out!");
   req.logout();
   req.flash("regular", "Logged you out!"); 
   res.redirect("/");
});

//middleware
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}


module.exports = router;