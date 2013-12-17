var mongoose = require('mongoose'),
    findOrCreate = require('mongoose-findorcreate');
var Schema = mongoose.Schema;

var ChatRequestSchema = new Schema({
    from:   {type: String, required: true},
    to:     {type: String, required: true},
    username: {type: String},
    topic: {type: String},
    created_at: {type: Date, 'default': Date.now }
});

ChatRequestSchema.pre('save', function(next) {
    if (this.isNew) {
        this.created_at = Date.now;
    }
    next();
});

ChatRequestSchema.plugin(findOrCreate);
module.exports = ChatRequestSchema;
