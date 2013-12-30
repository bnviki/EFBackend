var mongoose = require('mongoose'),
    findOrCreate = require('mongoose-findorcreate');

var emailRegexp = /.+\@.+\..+/;

var UserSchema = new mongoose.Schema({
	email: {
		type:String, 
		unique: true, 
		required: true, 
		match: emailRegexp, 
		trim: true},
	username: {
		   type:String, 
		   unique: true,		    
		   trim: true},
	displayname: {
		   type:String, 		   
		   trim: true},
	password: {
		   type:String, 		   
		   trim: true},
	extid: String,
	gender: {
		type: String,
		uppercase: true,
		'enum': ['M', 'F', 'NS']},
	picture: String,
    interests: {
		   	categories: [mongoose.Schema.Types.ObjectId]},
    status_message: {type: String, default: 'Hi there, lets talk!!'},
    signup_complete : {type: Boolean, default: false},
	validated: {
		     type: Boolean,
		     default: false},
	created_at: {
			type: Date,
			default: Date.now,
			set: function(val) {
				return undefined;
			}
		    }	

});

if (!UserSchema.options.toJSON) UserSchema.options.toJSON = {};
UserSchema.options.toJSON.hide = 'password extid signup_complete validated created_at __v';
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

UserSchema.pre('save', function(next) {	
	if (this.isNew) {
		this.created_at = Date.now;
	}	
	next();
});

UserSchema.plugin(findOrCreate);
module.exports = UserSchema;

