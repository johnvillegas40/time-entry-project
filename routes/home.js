var express = require("express");
var router = express.Router();
var TimeEntry = require("../models/timeentry");
var middleware = require("../middleware/index");
//==================================================================
// Time Entry Routes
//==================================================================

// Index Route- Show all of the users Time Entries
router.get("/", middleware.isLoggedIn, function(req, res) {
  req.user;
  //Get all Time Entries from DB
  TimeEntry.find({ "author.username": req.user.username }, function(
    err,
    alltimeentries
  ) {
    if (err) {
      console.log(err);
    } else {
      console.log(req.user.username + " has just logged in!");
      res.render("home", { timeentries: alltimeentries });
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
    mco: mco
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

//NEW - show form to create new Time Entry
router.get("/new", middleware.isLoggedIn, function(req, res) {
  res.render("new");
});
// Date Route- Show all of the users Time Entries for the specified date
router.get("/:date", middleware.isLoggedIn, function(req, res) {
  req.user;
  //Get all Time Entries from DB
  var timeReg = req.params.date.replace(/_/g, "-"); // puts it back in the DB Format
  TimeEntry.find({ date: timeReg }, function(err, alltimeentries) {
    if (err) {
      console.log(err);
    } else {
      res.render("date", { timeentries: alltimeentries });
    }
  });
});
// Date Print Route- Show all of the users Time Entries for the specified date
router.get("/:date/print", middleware.isLoggedIn, function(req, res) {
  req.user;
  //Get all Time Entries from DB
  var timeReg = req.params.date.replace(/_/g, "-"); // puts it back in the DB Format
  TimeEntry.find({ date: timeReg }, function(err, alltimeentries) {
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

router.put("/:date/:id", middleware.checkTimeEntryOwnership, function(
  req,
  res
) {
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
