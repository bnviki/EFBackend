var mongoose = require('mongoose'),
    findOrCreate = require('mongoose-findorcreate'),
    random = require('randomstring');
var Schema = mongoose.Schema;

var ChatSchema = new Schema({
    anonymous_chat: {type: Boolean},
    anonymous_user: {
        name: String,
        jid: String
    },
    users: {type: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}], index: true},
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
