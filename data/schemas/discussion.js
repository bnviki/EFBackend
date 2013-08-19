var mongoose = require('mongoose'),
    findOrCreate = require('mongoose-findorcreate');

var DiscussionSchema = new mongoose.Schema({
	content: {
		  type: String,
		  required: true},
	type: {
		type: String,
		uppercase: true,
		'enum': ['SINGLE', 'GROUP']},
        category: {
                   type: mongoose.Schema.Types.ObjectId,
                   required: true,
                   ref: 'Category'},
        created_by: { 
		     type: mongoose.Schema.Types.ObjectId,
                     required: true,
		     ref: 'User'},
        interested_users: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
	created_at: {
			type: Date,
			default: Date.now,			
		    },	
	updated_at: {
			type: Date,
			default: Date.now,			
		    }


});

DiscussionSchema.pre('save', function(next) {
	if (this.isNew) {
		this.created_at = Date.now;
	}	
        this.updated_at = Date.now;
	next();
});

module.exports = DiscussionSchema;
