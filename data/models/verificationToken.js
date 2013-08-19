var mongoose = require('mongoose'),
    verificationTokenSchema = require('../schemas/emailVerification'),
    User = require('./user');


var verificationTokenModel = mongoose.model('VerificationToken', verificationTokenSchema);
module.exports.verificationTokenModel = verificationTokenModel;

module.exports.verifyUser = function(token, done) {
    verificationTokenModel.findOne({token: token}, function (err, doc){
        if (err) return done(err);
        User.findOne({_id: doc._userId}, function (err, user) {
            if (err) return done(err);
            user.validated = true;
            user.save(function(err) {
                done(err);
            })
        })
    })
}
