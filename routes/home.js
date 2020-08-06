var express = require("express");
var router = express.Router();
var TimeEntry = require("../models/timeentry");
var middleware = require("../middleware/index");
var User = require("../models/user");
const user = require("../models/user");

//==================================================================
// Time Entry
//==================================================================

//==================================================================
// Home Routes
//==================================================================

// Index Route- Show all of the users Time Entries
router.get("/", middleware.isLoggedIn, function (req, res) {
  req.user;
  //Get all Time Entries from DB
  TimeEntry.find(
    { "author.username": req.user.username, isArchived: false },
    function (err, alltimeentries) {
      if (err) {
        console.log(err);
      } else {
        console.log(req.user.username + " has just logged in!");
        res.render("home", {
          timeentries: alltimeentries,
          username: req.user.username,
        });
      }
    }
  );
});

//NEW - show form to create new Time Entry
router.get("/new", middleware.isLoggedIn, function (req, res) {
  res.render("new");
});
// All Print Route- Show all of the users Time Entries
router.get("/printall", middleware.isLoggedIn, function (req, res) {
  req.user;
  //Get all Time Entries from DB
  TimeEntry.find(
    { "author.username": req.user.username, isArchived: false },
    function (err, alltimeentries) {
      if (err) {
        console.log(err);
      } else {
        res.render("print", { timeentries: alltimeentries });
      }
    }
  );
});

// Create - Add new Time Entry to Database
router.post("/", middleware.isLoggedIn, function (req, res) {
  // get data from form and add to Time Entry array
  var date = req.body.date;
  var ftcn = req.body.ftcn;
  var description = req.body.description;
  var author = {
    id: req.user._id,
    username: req.user.username,
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
    isArchived: false,
  };

  // Create a new Time Entry and save to DB
  TimeEntry.create(newTimeEntry, async function (err, newlyCreated) {
    if (err) {
      console.log(err);
    } else {
      // redirect back to Time Entry page
      const user = await User.findOne({'username': req.user.username})
      user.activeEntryCount += 1;
      await user.save()
      .then(() => {
        res.redirect("/home");
      })
    }
  });
});

// delete all time entries
router.delete("/", middleware.isLoggedIn, function (req, res) {
  TimeEntry.remove({ "author.username": req.user.username }, async function (err) {
    if (err) {
      res.redirect("/home");
    } else {
      const user = await User.findOne({'username': req.user.username})
      user.activeEntryCount = 0;
      await user.save()
      .then(() => {
        res.redirect("/home");
      })
    }
  });
});

//==================================================================
// Admin Routes
//==================================================================

// Index Route- Show all of the users Time Entries
router.get("/admin", middleware.isLoggedIn, middleware.isAdmin, (req, res) => {
  User.find({}, (err, allUsers) => {
    if (err) {
      req.flash("error", "Something went wrong...");
      res.redirect("/home");
    } else {
      let userInfo = []
      allUsers.forEach((user) => {
        userInfo.push({'firstName': user.firstName, 'lastName': user.lastName, 'entryCount': user.activeEntryCount, 'username': user.username})
      })
      res.render("admin", {userInfo: userInfo})
    }
  })
});

router.get("/admin/users/:user/settings", middleware.isLoggedIn, (req, res) => {
  User.find({username: req.params.user}, (err, user) => {
    if (err) {
      req.flash("error", "Something went wrong...");
      res.redirect("/admin");
    } else {
      res.render("adminsettings", {userInfo: user[0]});
    }
  })
})

router.put("/admin/users/:user/updatepassword", middleware.isLoggedIn, (req, res) => {
  User.findOne({ username: req.params.user }, (err, user) => {
    // Check if error connecting'
    if (err) {
      res.json({ success: false, message: err }); // Return error
    } else {
      // Check if user was found in database
      if (!user) {
        res.json({ success: false, message: "User not found" }); // Return error, user was not found in db
      } else {
        user.setPassword(req.body.newPassword, function (err) {
            if (err) {
              req.flash("error", "Something Went Wrong...");
              res.redirect("/home/admin");
            } else {
              req.flash("regular", "Password Updated Successfully for " + user.firstName + " " + user.lastName);
              res.redirect("/home/admin");
            }
          }
        );
      }
    }
  });
});

router.put("/admin/users/:user/updateprofile", middleware.isLoggedIn, (req, res) => {
  console.log(req.body.User.isAdmin)
  User.findOneAndUpdate(
    { username: req.params.user },
    req.body.User,
    (err, updatedUser) => {
      if (!err) {
        req.flash("regular", "Information updated successfully");
        res.redirect("/home/admin");
      } else {
        console.log(err)
        req.flash("error", "There was an error, please try again");
        res.redirect("/home/admin");
      }
    }
  );
});


router.get("/admin/users/:user", middleware.isLoggedIn, middleware.isAdmin, (req, res) => {

  TimeEntry.find(
    { "author.username": req.params.user, "isArchived": false },
    function (err, alltimeentries) {
      if (err) {
        console.log(err);
      } else {
        res.render("adminuserdates", {
          timeentries: alltimeentries,
          username: req.params.user,
        });
      }
    }
  );
})

router.get("/admin/users/:user/:date", middleware.isLoggedIn, middleware.isAdmin, (req, res) => {
    //Get all Time Entries from DB
    var timeReg = req.params.date.replace(/_/g, "-"); // puts it back in the DB Format
    TimeEntry.find(
      { "author.username": req.params.user, date: timeReg, isArchived: false },
      function (err, alltimeentries) {
        if (err) {
          console.log(err);
        } else if (alltimeentries.length < 1) {
          res.redirect("/home");
        } else {
          res.render("admindate", { timeentries: alltimeentries });
        }
      }
    );
  });

  router.get("/admin/users/:user/:date/print", middleware.isLoggedIn, function (req, res) {
    //Get all Time Entries from DB
    var timeReg = req.params.date.replace(/_/g, "-"); // puts it back in the DB Format
    TimeEntry.find(
      { "author.username": req.params.user, date: timeReg },
      function (err, alltimeentries) {
        if (err) {
          console.log(err);
        } else {
          res.render("print", { timeentries: alltimeentries });
        }
      }
    );
  });

  router.put("/admin/users/:user/:date/archive", middleware.isLoggedIn, async (req, res) => {
    var timeReg = req.params.date.replace(/_/g, "-"); // puts it back in the DB Format
  
  
    TimeEntry.updateMany(
      {"author.username": req.params.user, date: timeReg, isArchived: false },
      { isArchived: true },
      async (err, updatedEntries) => {
        if (err) {
          req.flash("error", err.name);
          return res.redirect("/home");
        }
        const user = await User.findOne({'username': req.params.user})
        console.log(updatedEntries)
        user.activeEntryCount -= updatedEntries.n; //n is the field that mongoose uses to represent how many records were updated.
        await user.save()
        .then(() => {
        req.flash("regular", "Date Archived.");
        return res.redirect("/home/admin");
        })
        
      }
    );
  });




//==================================================================
// Profile Routes
//==================================================================

//Profile Page

router.get("/profile/:user", middleware.isLoggedIn, (req, res) => {
  if (req.params.user !== req.user.username) {
    return res.redirect("/home");
  } else {
    User.findOne({ username: req.params.user }, (err, user) => {
      if (err) {
        req.flash("error", "Something went wrong...");
        res.redirect("/home");
      } else {
        TimeEntry.find(
          { "author.username": req.user.username, 'isArchived': true },
          (err, allArchivedEntries) => {
            if (err) {
              req.flash("error", err.name);
              res.redirect("/home");
            } else {
              res.render("profile", {
                user: user,
                timeentries: allArchivedEntries,
              });
            }
          }
        );
      }
    });
  }
});

// ArchivedDate Route- View the Time entries under the archived date.
router.get("/profile/:user/archived/:date", middleware.isLoggedIn, function (
  req,
  res
) {
  //Get all Time Entries from DB
  var timeReg = req.params.date.replace(/_/g, "-"); // puts it back in the DB Format
  TimeEntry.find(
    { "author.username": req.user.username, date: timeReg, isArchived: true },
    function (err, alltimeentries) {
      if (err) {
        console.log(err);
      } else if (alltimeentries.length < 1) {
        res.redirect(`/profile/${req.params.user}`);
      } else {
        res.render("archivedate", {
          timeentries: alltimeentries,
          user: req.user.username,
        });
      }
    }
  );
});

// SHOW  Archived Entry- Shows more info about one Archived Time Entry Time Entry
router.get("/profile/:user/archived/:date/:id", function (req, res) {
  if (req.params.user !== req.user.username) {
    req.flash("error", "Invalid Request");
    req.redirect(`/profile/${req.user.username}`);
  }
  //find the Time Entry with provided ID
  TimeEntry.findById(req.params.id).exec(function (err, foundTimeEntry) {
    if (err) {
      console.log(err);
      res.redirect("/home/" + req.params.date);
    } else {
      // render show template with that Time Entry
      res.render("show", {
        timeEntry: foundTimeEntry,
        user: req.user.username,
      });
    }
  });
});

//edit Archived Time Entry route
router.get(
  "/profile/:user/archived/:date/:id/edit",
  middleware.checkTimeEntryOwnership,
  function (req, res) {
    TimeEntry.findById(req.params.id, function (err, foundTimeEntry) {
      if (err) {
        console.log(err);
      } else {
        res.render("edit", { timeEntry: foundTimeEntry });
      }
    });
  }
);

// Update User

router.put("/profile", middleware.isLoggedIn, (req, res) => {
  User.findByIdAndUpdate(
    { _id: req.user._id },
    req.body.User,
    (err, updatedUser) => {
      if (!err) {
        req.flash("regular", "Information updated successfully");
        res.redirect("/home/profile/" + req.user.username);
      } else {
        req.flash("error", "There was an error, please try again");
        res.redirect("/home/profile/" + req.user.username);
      }
    }
  );
});

router.put("/updatepassword", middleware.isLoggedIn, (req, res) => {
  User.findOne({ _id: req.user._id }, (err, user) => {
    // Check if error connecting
    if (err) {
      res.json({ success: false, message: err }); // Return error
    } else {
      // Check if user was found in database
      if (!user) {
        res.json({ success: false, message: "User not found" }); // Return error, user was not found in db
      } else {
        user.changePassword(
          req.body.oldPassword,
          req.body.newPassword,
          function (err) {
            if (err) {
              if (err.name === "IncorrectPasswordError") {
                req.flash("error", "Incorrect Password");
                res.redirect("/home/profile/" + req.user.username);
              } else {
                req.flash("error", err.name);
                res.redirect("/home/profile/" + req.user.username);
              }
            } else {
              req.flash("regular", "Password Updated Successfully");
              res.redirect("/home/profile/" + req.user.username);
            }
          }
        );
      }
    }
  });
});

router.put("/archivedate/:date", middleware.isLoggedIn, async (req, res) => {
  var timeReg = req.params.date.replace(/_/g, "-"); // puts it back in the DB Format


  TimeEntry.updateMany(
    {'author.username':req.user.username, date: timeReg, isArchived: false },
    { isArchived: true },
    async (err, updatedEntries) => {
      if (err) {
        req.flash("error", err.name);
        return res.redirect("/home");
      }
      const user = await User.findOne({'username': req.user.username})
      console.log(updatedEntries)
      user.activeEntryCount -= updatedEntries.n; //n is the field that mongoose uses to represent how many records were updated.
      await user.save()
      .then(() => {
      req.flash("regular", "Date Archived.");
      return res.redirect("/home");
      })
      
    }
  );
});

// Unarchive Date Route - Return the Date to unarchived
router.put("/unarchivedate/:date", middleware.isLoggedIn, (req, res) => {
  var timeReg = req.params.date.replace(/_/g, "-"); // puts it back in the DB Format
  TimeEntry.updateMany(
    {'author.username': req.user.username, date: timeReg, isArchived: true },
    { isArchived: false },
    async (err, updatedEntries) => {
      if (err) {
        req.flash("error", err.name);
        res.redirect("/home");
      }
      const user = await User.findOne({'username': req.user.username})
      console.log(updatedEntries.n);
      user.activeEntryCount += updatedEntries.n; //n is the field that mongoose uses to represent how many records were updated.
      await user.save()
      .then(() => {
        req.flash("regular", "Date Unarchived.");
        res.redirect("/home");
      })

    }
  );
});

//==================================================================
// Date Routes
//==================================================================

// Date Route- Show all of the users Time Entries for the specified date
router.get("/dates/:date", middleware.isLoggedIn, function (req, res) {
  req.user;
  //Get all Time Entries from DB
  var timeReg = req.params.date.replace(/_/g, "-"); // puts it back in the DB Format
  TimeEntry.find(
    { "author.username": req.user.username, date: timeReg, isArchived: false },
    function (err, alltimeentries) {
      if (err) {
        console.log(err);
      } else if (alltimeentries.length < 1) {
        res.redirect("/home");
      } else {
        console.log(alltimeentries);
        res.render("date", { timeentries: alltimeentries });
      }
    }
  );
});
// Delete Date
router.delete("/:date", middleware.isLoggedIn, function (req, res) {
  var timeReg = req.params.date.replace(/_/g, "-"); // puts it back in the DB Format
  TimeEntry.remove({ "author.username": req.user.username, date: timeReg }, async function (err, count) {
    if (err) {
      res.redirect("/home");
    } else {

      const user = await User.findOne({'username': req.user.username})
      user.activeEntryCount -= count.deletedCount;
      await user.save()
      .then(() => {
        res.redirect("/home");
      })
    }
  });
});

// Date Print Route- Show all of the users Time Entries for the specified date
router.get("/dates/:date/print", middleware.isLoggedIn, function (req, res) {
  req.user;
  //Get all Time Entries from DB
  var timeReg = req.params.date.replace(/_/g, "-"); // puts it back in the DB Format
  TimeEntry.find(
    { "author.username": req.user.username, date: timeReg },
    function (err, alltimeentries) {
      if (err) {
        console.log(err);
      } else {
        res.render("print", { timeentries: alltimeentries });
      }
    }
  );
});

// SHOW - Shows more info about one Time Entry
router.get("/dates/:date/:id", function (req, res) {
  //find the Time Entry with provided ID
  TimeEntry.findById(req.params.id).exec(function (err, foundTimeEntry) {
    if (err) {
      console.log(err);
      res.redirect("/home/" + req.params.date);
    } else {
      // render show template with that Time Entry
      res.render("show", { timeEntry: foundTimeEntry });
    }
  });
});

//edit Time Entry route
router.get("/dates/:date/:id/edit", middleware.checkTimeEntryOwnership, function (
  req,
  res
) {
  TimeEntry.findById(req.params.id, function (err, foundTimeEntry) {
    if (err) {
      console.log(err);
    } else {
      res.render("edit", { timeEntry: foundTimeEntry });
    }
  });
});



// update Time Entry route

router.put("/dates/:date/:id", middleware.checkTimeEntryOwnership, function (
  req,
  res
) {
  //find and update the correct TimeEntry
  TimeEntry.findByIdAndUpdate(req.params.id, req.body.timeEntry, function (
    err,
    updatedTimeEntry
  ) {
    if (err) {
      res.redirect("/home");
    } else {
      // redirect somewhere(showpage)
      console.log(req.params.date);
      res.redirect("/home/dates/" + req.params.date + "/" + req.params.id);
    }
  });
});

//Delete Time Entry route

router.delete("/dates/:date/:id", middleware.checkTimeEntryOwnership, function (
  req,
  res
) {
  TimeEntry.findByIdAndRemove(req.params.id, async function (err) {
    if (err) {
      res.redirect("/home");
    } else {
      const user = await User.findOne({'username': req.user.username})
      user.activeEntryCount -= 1;
      await user.save()
      .then(() => {
        res.redirect("/home");
      })
    }
  });
});



module.exports = router;
