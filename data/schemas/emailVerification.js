var mongoose = require('mongoose'),
    uuid = require('node-uuid');

var Schema = mongoose.Schema;

var verificationTokenSchema = new Schema({
    _userId: {type: Schema.ObjectId, required: true, ref: 'User'},
    token: {type: String, required: true},
    createdAt: {type: Date, required: true, default: Date.now, expires: '4h'}
});


verificationTokenSchema.methods.createVerificationToken = function (done) {
    var verificationToken = this;
    var token = uuid.v4();
    verificationToken.set('token', token);
    verificationToken.save( function (err) {
        if (err) return done(err);
        return done(null, token);
        console.log("Verification token", verificationToken);
    });
};

module.exports = verificationTokenSchema;
