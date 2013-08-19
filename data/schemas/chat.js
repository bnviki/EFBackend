var mongoose = require('mongoose'),
    findOrCreate = require('mongoose-findorcreate');
var Schema = mongoose.Schema;

var ChatSchema = new Schema({
	users: [Schema.Types.ObjectId]
        category: {
                   type: mongoose.Schema.Types.ObjectId},
        discussion: {
                   type: mongoose.Schema.Types.ObjectId},
	created_at: {
			type: Date,
			'default': Date.now,
			set: function(val) {
				return undefined;
			}
		    }
});

ChatSchema.pre('save', function(next) {
	if (this.isNew) {
		this.created_at = undefined;
	}	
	next();
});

module.exports = ChatSchema;
