/*all routes for /users */

var User = require('../data/models/user'),
    verification = require('../data/models/verificationToken'),	
    sendMail = require('./middleware/mailer'),
    sessionUtils = require('./middleware/session_utils'),
    ChatRequest = require('../data/models/chatRequest'),
    xmppUser = require('./middleware/xmpp_user');

module.exports = function(app) {

	app.get("/users/chatrequests", function (req, res, next) {
        if(!req.user){
            res.send('no requests', 204);
            return;
        }

		ChatRequest.find({to: req.user.username}, function(err, reqs){
			if(err) return res.send('no requests', 204);
			res.send(reqs);
		});    
	});

    app.get("/users/chats", function (req, res, next) {
        if(!req.session.chats) return res.send('no chats', 204);
        res.send(req.session.chats);
    });


    app.get('/users', function(req, res) {
	  var allUsers = User.find(req.query,function(err, users) {
		if (err) {
			return next(err);
		}
        var jsonUsers = [];
        users.forEach(function(user){
            jsonUsers.push(user.toJSON());
        });
		res.send(jsonUsers);
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
		res.send(user.toJSON());
	  });
	});

	app.post('/users', sessionUtils.notLoggedIn, function(req, res, next) {	
		if(!req.body.displayname)
			req.body.displayname = req.body.username;
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
			//email verification
/*			var vToken = new verification.verificationTokenModel({_userId: user._id});
			vToken.createVerificationToken(function (err, token) {
			    if (err) return console.log("Couldn't create verification token", err);
			    var verifyURL = req.protocol + "://" + req.get('host') + "/verify/" + token;
			    sendMail(user.email, "mpeers: verification", verifyURL, null)
			});*/
			//email verification
            xmppUser.createUser(user);
			res.send(user.toJSON());
		});  
	});

	app.post('/users/:id', sessionUtils.loggedIn, function(req, res, next) {
		var newuser = req.body;
        if(newuser.displayname)
		    req.user.displayname = newuser.displayname;
        if(newuser.picture)
		    req.user.picture = newuser.picture;
        if(newuser.gender)
            req.user.gender = newuser.gender;
        if(newuser.status_message)
            req.user.status_message = newuser.status_message;
        if(!req.user.username && newuser.username){
            req.user.username = newuser.username;
            xmppUser.createUser(req.user);
        }
        if(req.user.displayname && req.user.picture)
            req.user.signup_complete = true;
		req.user.save(function(err) {
		  if (err) { return next(err); }
		res.send(req.user.toJSON());
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

