var mongoose = require("mongoose");

// Schema Setup

var timeEntrySchema = new mongoose.Schema({
    date: String,
    cust: String,
    description: String,
    author: {
        id:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    ftcn: String,
    billcode: String,
    job: String,
    agr: String,
    starttime: Date,
    endtime: Date,
    totaltime: Number,
    mco: String
});

module.exports = mongoose.model("TimeEntry", timeEntrySchema);