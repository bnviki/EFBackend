var mongoose = require('mongoose'),
    findOrCreate = require('mongoose-findorcreate'),
    random = require('randomstring');
var Schema = mongoose.Schema;

var ChatSchema = new Schema({
    ann_user: {
        name: String,
        jid: String
    },
    room: {
        type: String,
        unique: true
    },
    created_at: {
        type: Date,
        index: true,
        default: Date.now()
    }
});

ChatSchema.pre('save', function(next) {
    if (this.isNew) {
        this.created_at = Date.now();
        this.room = random.generate(20);
    }
    next();
});

module.exports = ChatSchema;
