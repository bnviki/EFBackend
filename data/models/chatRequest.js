var mongoose = require('mongoose');
var ChatRequestSchema = require('../schemas/chatRequest');
var ChatRequest = mongoose.model('ChatRequest', ChatRequestSchema);
module.exports = ChatRequest;

