var express = require("express");
var router = express.Router();
var TimeEntry = require("../models/timeentry");
var middleware = require("../middleware/index");
var User = require("../models/user");
//================================================================== 
// Time Entry Routes
//==================================================================

// Index Route- Show all of the users Time Entries
router.get("/", middleware.isLoggedIn, function(req, res) {
  req.user;
  //Get all Time Entries from DB
  TimeEntry.find({ "author.username": req.user.username, "isArchived": false }, function(
    err,
    alltimeentries
  ) {
    if (err) {
      console.log(err);
    } else {
      console.log(req.user.username + " has just logged in!");
      res.render("home", { timeentries: alltimeentries, username: req.user.username });
    }
  });
});

// Create - Add new Time Entry to Database
router.post("/", middleware.isLoggedIn, function(req, res) {
  // get data from form and add to Time Entry array
  var date = req.body.date;
  var ftcn = req.body.ftcn;
  var description = req.body.description;
  var author = {
    id: req.user._id,
    username: req.user.username
  };
  var cust = req.body.cust,
    billcode = req.body.billcode,
    job = req.body.job,
    agr = req.body.agr,
    starttime = req.body.starttime,
    endtime = req.body.endtime,
    totaltime = req.body.totaltime,
    mco = req.body.mco;

    var newTimeEntry = {
      date: date,
      ftcn: ftcn,
      description: description,
      author: author,
      cust: cust,
      billcode: billcode,
      job: job,
      agr: agr,
      starttime: starttime,
      endtime: endtime,
      totaltime: totaltime,
      mco: mco,
      isArchived: false
    };

 
  // Create a new Time Entry and save to DB
  TimeEntry.create(newTimeEntry, function(err, newlyCreated) {
    if (err) {
      console.log(err);
    } else {
      // redirect back to Time Entry page
      res.redirect("/home");
    }
  });
});

router.put("/archivedate/:date", middleware.isLoggedIn, (req, res) => {
  var timeReg = req.params.date.replace(/_/g, "-"); // puts it back in the DB Format
  TimeEntry.updateMany({date: timeReg, isArchived: false}, {isArchived: true}, (err, updatedEntries) => {
    if (err) {
      req.flash("error", err.name);
      return res.redirect("/home");
    }
    req.flash("regular", "Date Archived.")
    return res.redirect("/home");
  })
})

//NEW - show form to create new Time Entry
router.get("/new", middleware.isLoggedIn, function(req, res) {
  res.render("new");
});
// All Print Route- Show all of the users Time Entries 
router.get("/printall", middleware.isLoggedIn, function(req, res) {
  req.user;
  //Get all Time Entries from DB
  TimeEntry.find({ "author.username": req.user.username, }, function(err, alltimeentries) {
    if (err) {
      console.log(err);
    } else {
      res.render("print", { timeentries: alltimeentries });
    }
  });
});

//Profile Page

router.get("/profile/:user", middleware.isLoggedIn, (req, res) => {
  if(req.params.user !== req.user.username) {
    return res.redirect("/home")
  } else {
    User.findOne({username: req.params.user}, (err, user) => {
      if(err) {
        req.flash("error", "Something went wrong...")
        res.redirect("/home")
      } else {
        TimeEntry.find({"author.username": req.user.username, "isArchived": true}, (err, allArchivedEntries) => {
          if(err) {
            req.flash("error", err.name);
            res.redirect("/home");
          } else {
            res.render("profile", {user: user, timeentries: allArchivedEntries});
          }
        })
          
        }
      })
  }
})

// ArchivedDate Route- View the Time entries under the archived date. 
router.get("/profile/:user/archived/:date", middleware.isLoggedIn, function(req, res) {
  //Get all Time Entries from DB
  var timeReg = req.params.date.replace(/_/g, "-"); // puts it back in the DB Format
  TimeEntry.find({ "author.username": req.user.username, "date": timeReg, "isArchived": true }, function(err, alltimeentries) {
    if (err) {
      console.log(err);
    } else if(alltimeentries.length < 1) {
      res.redirect(`/profile/${req.params.user}`)
    } else {
      res.render("archivedate", { timeentries: alltimeentries, user: req.user.username });
    }
  });
});

// Unarchive Date Route - Return the Date to unarchived
router.put("/unarchivedate/:date", middleware.isLoggedIn, (req, res) => {
  var timeReg = req.params.date.replace(/_/g, "-"); // puts it back in the DB Format
  TimeEntry.updateMany({date: timeReg, isArchived: true}, {isArchived: false}, (err, updatedEntries) => {
    if (err) {
      req.flash("error", err.name);
      res.redirect("/home");
    }
    req.flash("regular", "Date Unarchived.")
    res.redirect("/home");
  })
})



// SHOW  Archived Entry- Shows more info about one Archived Time Entry Time Entry
router.get("/profile/:user/archived/:date/:id", function(req, res) {
  if (req.params.user !== req.user.username) {
    req.flash("error", "Invalid Request");
    req.redirect(`/profile/${req.user.username}`)
  }
  //find the Time Entry with provided ID
  TimeEntry.findById(req.params.id).exec(function(err, foundTimeEntry) {
    if (err) {
      console.log(err);
      res.redirect('/home/' + req.params.date)
      
    } else {
      // render show template with that Time Entry
      res.render("show", { timeEntry: foundTimeEntry, user: req.user.username });
    }
  });
});

//edit Archived Time Entry route
router.get("/profile/:user/archived/:date/:id/edit", middleware.checkTimeEntryOwnership, function(
  req,
  res
) {
  TimeEntry.findById(req.params.id, function(err, foundTimeEntry) {
    if (err) {
      console.log(err);
    } else {
      res.render("edit", { timeEntry: foundTimeEntry });
    }
  });
});
// Update User

router.put("/profile", middleware.isLoggedIn, (req, res) =>{
  User.findByIdAndUpdate({"_id": req.user._id}, req.body.User, (err, updatedUser) => {
    if(!err) {
      req.flash("regular", "Information updated successfully")
      res.redirect("/home/profile/" + req.user.username)
    } else {
      req.flash("error", "There was an error, please try again")
      res.redirect("/home/profile/" + req.user.username)
    }
  } )
})

router.put("/updatepassword", middleware.isLoggedIn, (req, res) => {
  User.findOne({ _id: req.user._id },(err, user) => {
    // Check if error connecting
    if (err) {
      res.json({ success: false, message: err }); // Return error
    } else {
      // Check if user was found in database
      if (!user) {
        res.json({ success: false, message: 'User not found' }); // Return error, user was not found in db
      } else {
        user.changePassword(req.body.oldPassword, req.body.newPassword, function(err) {
           if(err) {
                    if(err.name === 'IncorrectPasswordError'){
                          req.flash("error", "Incorrect Password")
                          res.redirect("/home/profile/" + req.user.username)
                    }else {
                      req.flash("error", err.name)
                      res.redirect("/home/profile/" + req.user.username)
                    }
          } else {
            req.flash("regular", "Password Updated Successfully")
            res.redirect("/home/profile/" + req.user.username)
           }
         })
      }
    }
  });
})



// Date Route- Show all of the users Time Entries for the specified date
router.get("/:date", middleware.isLoggedIn, function(req, res) {
  req.user;
  //Get all Time Entries from DB
  var timeReg = req.params.date.replace(/_/g, "-"); // puts it back in the DB Format
  TimeEntry.find({ "author.username": req.user.username, "date": timeReg, "isArchived": false }, function(err, alltimeentries) {
    if (err) {
      console.log(err);
    } else if(alltimeentries.length < 1) {
      res.redirect("/home")
    } else {
      console.log(alltimeentries)
      res.render("date", { timeentries: alltimeentries });
    }
  });
});




// Date Print Route- Show all of the users Time Entries for the specified date
router.get("/:date/print", middleware.isLoggedIn, function(req, res) {
  req.user;
  //Get all Time Entries from DB
  var timeReg = req.params.date.replace(/_/g, "-"); // puts it back in the DB Format
  TimeEntry.find({ "author.username": req.user.username, date: timeReg }, function(err, alltimeentries) {
    if (err) {
      console.log(err);
    } else {
      res.render("print", { timeentries: alltimeentries });
    }
  });
});


// SHOW - Shows more info about one Time Entry
router.get("/:date/:id", function(req, res) {
  //find the Time Entry with provided ID
  TimeEntry.findById(req.params.id).exec(function(err, foundTimeEntry) {
    if (err) {
      console.log(err);
      res.redirect('/home/' + req.params.date)
      
    } else {
      // render show template with that Time Entry
      res.render("show", { timeEntry: foundTimeEntry });
    }
  });
});

//edit Time Entry route
router.get("/:date/:id/edit", middleware.checkTimeEntryOwnership, function(
  req,
  res
) {
  TimeEntry.findById(req.params.id, function(err, foundTimeEntry) {
    if (err) {
      console.log(err);
    } else {
      res.render("edit", { timeEntry: foundTimeEntry });
    }
  });
});

// update Time Entry route

router.put("/:date/:id", middleware.checkTimeEntryOwnership, function(req, res) {
  //find and update the correct TimeEntry
  TimeEntry.findByIdAndUpdate(req.params.id, req.body.timeEntry, function(
    err,
    updatedTimeEntry
  ) {
    if (err) {
      res.redirect("/home");
    } else {
      // redirect somewhere(showpage)
      console.log(req.params.date);
      res.redirect("/home/" + req.params.date + "/" + req.params.id);
    }
  });
});

//Delete Time Entry route

router.delete("/:date/:id", middleware.checkTimeEntryOwnership, function(
  req,
  res
) {
  TimeEntry.findByIdAndRemove(req.params.id, function(err) {
    if (err) {
      res.redirect("/home");
    } else {
      res.redirect("/home");
    }
  });
});

// delete all time entries
router.delete("/", middleware.isLoggedIn, function(req, res) {
  TimeEntry.remove({ "author.username": req.user.username }, function(err) {
    if (err) {
      res.redirect("/home");
    } else {
      res.redirect("/home");
    }
  });
});


module.exports = router;
