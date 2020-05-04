var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
    // firstname: String,
    // lastname: String,
    // emailaddress: {
    //     type: String,
    //     required: true,
    //     unique: true,
    // },
    username: String
});


UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);