var mongoose = require('mongoose'),
    findOrCreate = require('mongoose-findorcreate') ;

var emailRegexp = /.+\@.+\..+/;

var UserSchema = new mongoose.Schema({
    email: {
        type:String,
        unique: true,
        required: true,
        match: emailRegexp,
        trim: true},
    location: {
        type:String,
        trim: true},
    username: {
        type:String,
        required: true,
        unique: true,
        trim: true},
    displayname: {
        type:String,
        trim: true},
    password: {
        type:String,
        required: true,
        trim: true},
    usertype: {
        type:String,
        trim: true},

    picture: {
        type: String,
        default: 'http://localhost:3000/profile/pictures/guest.png'
    },
    category: {type: mongoose.Schema.Types.ObjectId},
    description: {type: String, required: true},
    about: {type: String},
    phone: {type: String},
    address: {type: String},
    welcome_message: {type: String},
    offline_message: {type: String},

    validated: {
        type: Boolean,
        default: true},
    lastlogin: {
        type: Date
    },

    created_at: {
        type: Date
    }


});

if (!UserSchema.options.toJSON) UserSchema.options.toJSON = {};
UserSchema.options.toJSON.hide = 'validated created_at __v';
UserSchema.options.toJSON.transform = function (doc, ret, options) {
    if (options.hide) {
        options.hide.split(' ').forEach(function (prop) {
            delete ret[prop];
        });
    }
}

UserSchema.methods.validatePassword = function(password){
    if(this.password === password)
        return true;
    else
        return false;
}

UserSchema.methods.setLastLogin = function(){
    this.lastlogin = Date.now();
}


UserSchema.pre('save', function(next) {
    if (this.isNew) {
        this.created_at = Date.now();
        this.chats = [];
    }
    next();
});

UserSchema.plugin(findOrCreate);
module.exports = UserSchema;

