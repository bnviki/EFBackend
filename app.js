
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , passport = require('passport')
  , sessionUtils = require('./routes/middleware/session_utils')
  , Category = require('./data/models/category');
  

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use( express.cookieParser() );
app.use(express.session({ secret: 'mycat' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//mongo
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/openchat');
//mongo


app.get('/', routes.index);
app.get('/partial/login', sessionUtils.notLoggedIn, function (req, res) {
  res.render('partials/login');
});
app.get('/partial/:name', routes.partial);
require('./auth')(app, passport);
require('./routes/user')(app);
require('./routes/discussion')(app);
app.get('*', routes.index);

var cats = ['news','politics','sports','music','movies','gadjets','shopping','business','celebrity','technology',
'science','mathematics','history','religion','online games','arts','astronomy','health/fitness','cartoons/comics',
'travel/trekking','cars/bikes','pets','casual'];

for(var i = 0; i < cats.length; i++){
	Category.create({name:cats[i]}, function(err){
		if(err) return;		
	});
}

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
