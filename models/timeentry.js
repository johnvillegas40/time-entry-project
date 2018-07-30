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
    time: String,
    totaltime: String,
    mco: String
});

module.exports = mongoose.model("TimeEntry", timeEntrySchema);