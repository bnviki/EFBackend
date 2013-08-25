var mongoose = require('mongoose'),
    findOrCreate = require('mongoose-findorcreate');
var Schema = mongoose.Schema;

var ChatRequestSchema = new Schema({
	from: {type: Schema.Types.ObjectId, required: true},
	to: {type: Schema.Types.ObjectId, required: true},	
        category: {
                   type: mongoose.Schema.Types.ObjectId},
        discussion: {
                   type: mongoose.Schema.Types.ObjectId},
	created_at: {
			type: Date,
			'default': Date.now,			
		    }
});

ChatRequestSchema.pre('save', function(next) {
	if (this.isNew) {
		this.created_at = Date.now;
	}	
	next();
});

ChatRequestSchema.plugin(findOrCreate);
module.exports = ChatRequestSchema;
