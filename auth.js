var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
    LocalStrategy = require('passport-local').Strategy,
    FacebookStrategy = require('passport-facebook').Strategy,
    request = require('request'),
    User = require('./data/models/user');

module.exports = function(app, passport) {
	app.get('/auth/google', passport.authenticate('google', {scope: ['profile', 'email']}));
	app.get('/auth/google/callback', 
	passport.authenticate('google', { successRedirect: '/main',
		                          failureRedirect: '/' }));

	passport.use(new GoogleStrategy({
	    clientID: "177866912752.apps.googleusercontent.com",
    	    clientSecret: "SfBCxekc6wsiFM16X2jASrRp",
    	    callbackURL: "http://localhost:3000/auth/google/callback"
	  },
	  function(accessToken, refreshToken, profile, done) {
	    User.findOrCreate(
	      { extid: profile.id }, 
	      {displayname: profile['displayName'], email: profile.emails[0].value, extid: profile.id, picture: 
		"https://www.google.com/s2/photos/profile/" + profile.id}, 
	      function(err, user, created) {
		if(created){
			request('https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=' + accessToken, 
				function (error, response, body) {
				  if (!error && response.statusCode == 200) {
				    var bodyObj = JSON.parse(body);
				    if(bodyObj.gender === "male") user.gender = 'm';			    
				    else user.gender = 'f';

				    user.picture = bodyObj.picture
				    user.save(function (err) {
				      if(err)
				      	console.log(err.message);
				    })
				  }
				  if(error)
					console.log("error: " + error);
			})	
		}
	        done(err, user);
	      });
	  }	  
	));	

	app.get('/auth/facebook', passport.authenticate('facebook',  { scope: ['email'] }));
	app.get('/auth/facebook/callback', 
	  passport.authenticate('facebook', { successRedirect: '/main',
                                      	      failureRedirect: '/' }));

	passport.use(new FacebookStrategy({
    		clientID: "555808311121979",
	    	clientSecret: "d2a6aac217b5dacdfd45e9fb101b2923",
		callbackURL: "http://localhost:3000/auth/facebook/callback"
  	  },
	  function(accessToken, refreshToken, profile, done) {
	    User.findOrCreate(
	      { extid: profile.id }, 
	      {displayname: profile.displayName, email: profile.emails[0].value, extid: profile.id, 
		picture: "http://graph.facebook.com/"+ profile.id + "/picture?type=large"}, 
	      function(err, user, created) {
		if(created){
			request('https://graph.facebook.com/me?method=GET&format=json&access_token=' + accessToken, 
				function (error, response, body) {
				  if (!error && response.statusCode == 200) {
				    var bodyObj = JSON.parse(body);
				    if(bodyObj.gender === "male") user.gender = 'm';			    
				    else user.gender = 'f';
				    user.save(function (err) {
				      if(err)
				      	console.log(err.message);
				    })
				  }
				  if(error)
					console.log("error: " + error);
			})	
		}
	        done(err, user);
	    });
	  }
	));

	app.post('/login',
	  passport.authenticate('local'), function(req, res){
		res.send(req.user);
	});

	passport.use(new LocalStrategy(
	  function(username, password, done) {
	    User.findOne({ username: username }, function(err, user) {
	      if (err) { return done(err); }
	      if (!user) {
		return done(null, false, { message: 'Incorrect username.' });
	      }
	      if (!user.validatePassword(password)) {
		return done(null, false, { message: 'Incorrect password.' });
	      }
	      return done(null, user);
	    });
	  }
	));

	passport.serializeUser(function(user, done) {
		done(null, user._id);
	});

	passport.deserializeUser(function(userid, done) {
		User.findOne({ _id: userid }, function(err, user) {
			if(err){
				done(err, false);
			}			
			done(err, user);
		});
	});

	app.get('/logout', function(req, res){
	  req.logout();
	  res.send('success');
	});

	app.get('/ping', function(req, res){
	  if(req.user)	  
	  	res.send(req.user);
	  else{
		res.send('please login', 404);
	  }
	});
}
