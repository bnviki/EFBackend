/*all routes for /users */

var User = require('../data/models/user'),
    verification = require('../data/models/verificationToken'),	
    sendMail = require('./middleware/mailer'),
    sessionUtils = require('./middleware/session_utils');

module.exports = function(app) {
	app.get('/users', function(req, res) {
	  var allUsers = User.find({},function(err, users) {
		if (err) {
			return next(err);
		}
		res.send(users);
	  });  
	});

	app.get('/users/:id', function(req, res) {
	  User.findOne({_id: req.params.id}, function(err, user) {
		if (err) {
			return res.send('Not found', 404);
		}
		if (! user) {
			return res.send('Not found', 404);
		}
		res.send(user);
	  });
	});

	app.post('/users', sessionUtils.notLoggedIn, function(req, res, next) {	
		var user = new User(req.body);
		user.save(function(err){
			if (err) {
				if (err.code === 11000) {
				  res.send('Conflict', 409);
				} else {
				  next(err);
				}
				return;
			}
			var vToken = new verification.verificationTokenModel({_userId: user._id});
			vToken.createVerificationToken(function (err, token) {
			    if (err) return console.log("Couldn't create verification token", err);
			    var verifyURL = req.protocol + "://" + req.get('host') + "/verify/" + token;
			    sendMail(user.email, "mpeers: verification", verifyURL, null)
			});
			res.send(user);
		});  
	});

	app.post('/users/:id', sessionUtils.loggedIn, sessionUtils.restrictToCurrentUser, function(req, res, next) {
		var newuser = new User(req.body);
		req.user.displayname = newuser.displayname;
		req.user.picture = newuser.picture;
		req.user.save(function(err) {
		  if (err) { return next(err); }
		res.send(req.user);
	  });
	});	


	app.del('/users/:id', sessionUtils.loggedIn, sessionUtils.restrictToCurrentUser, function(req, res, next) {
		req.user.remove(function(err) {
		  if (err) { return next(err); }
		res.send('success');
	  });
	});	

	app.get("/verify/:token", sessionUtils.notLoggedIn, function (req, res, next) {
	    var token = req.params.token;
		verification.verifyUser(token, function(err) {
		if (err) return res.redirect("/");
		res.redirect("/");
	    });
	}); 
};

