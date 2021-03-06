var mongoose = require('mongoose'),
    findOrCreate = require('mongoose-findorcreate');

var CategorySchema = new mongoose.Schema({
	name: {
		   type:String, 
		   unique: true,		    
		   trim: true}
});

module.exports = CategorySchema;
