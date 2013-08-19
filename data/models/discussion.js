var mongoose = require('mongoose');
var DiscussionSchema = require('../schemas/discussion');
var Discussion = mongoose.model('Discussion', DiscussionSchema);
module.exports = Discussion;

