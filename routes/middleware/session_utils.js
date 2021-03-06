var User = require('../../data/models/user');

function notLoggedIn(req, res, next) {
    console.log('checking user: ' + req.user);
	if (req.user &&  req.user != null) {
		res.send('Unauthorized', 401);
	} else {
		next();
	}
}

function loggedIn(req, res, next) {
	if (req.user && req.user != null) {
		next();		
	} else {
		res.send('Unauthorized', 401);
	}
}

function loadUser(req, res, next) {
	User.findOne({username: req.params.name}, function(err, user) {
	if (err) {
		return next(err);
	}
	if (! user) {
		return res.send('Not found', 404);
	}
	req.user = user;
	next();
	});
}

function restrictUser(req, res, next){
	if(req.user && req.user != null && req.user._id === req.params.id)
		next();
	else
		res.send('Unauthorized', 401);	
}

module.exports.loadUser = loadUser;
module.exports.notLoggedIn = notLoggedIn;
module.exports.loggedIn = loggedIn;
module.exports.restrictToCurrentUser = restrictUser;






