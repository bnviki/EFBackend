var mongoose = require('mongoose'),
    findOrCreate = require('mongoose-findorcreate'),
    random = require('randomstring');
var Schema = mongoose.Schema;

var ChatSchema = new Schema({
    users: [String],
    topic: {type: String},
    room: { type: String },
    username: {type: String},
    created_at: {
        type: Date,
        'default': Date.now

    }
});

ChatSchema.pre('save', function(next) {
    if (this.isNew) {
        this.created_at = Date.now;
        this.room = random.generate(20);
    }
    next();
});

module.exports = ChatSchema;
