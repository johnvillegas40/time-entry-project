var TimeEntry = require("../models/timeentry");

// All of the middleware goes here 
var middlewareObj = {};

middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "Please Login First");
    res.redirect("/login");
}

middlewareObj.checkTimeEntryOwnership = function(req, res, next){
    if(req.isAuthenticated()){
    TimeEntry.findById(req.params.id, function(err, foundTimeEntry){
        if(err){
            res.redirect("back");
        } else {
            if(foundTimeEntry.author.id.equals(req.user._id)) {
                next();
            } else {
                res.redirect("back");
            }
            
        }
    });
    } else {
        res.redirect("back")
    }
}
middlewareObj.usernameToLowerCase = (req, res, next) => {
    req.body.username = req.body.username.toLowerCase();
    next();
}
middlewareObj.isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}
middlewareObj.isAdmin = (req, res, next) => {
    if(req.user.isAdmin) {
        return next()
    }
    res.redirect("back");
}


module.exports = middlewareObj;