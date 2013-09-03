
/**
 * Module dependencies.
 */

var express = require('express.io')
    , routes = require('./routes')
    , user = require('./routes/user')
    , http = require('http')
    , httpProxy = require('http-proxy')
    , path = require('path')
    , passport = require('passport')
    , sessionUtils = require('./routes/middleware/session_utils')
    , Category = require('./data/models/category')
    , xmpp = require('node-xmpp');
    //, socketio = require('socket.io');

var app = express();
app.http().io();

var sessionSecret = 'mycat';

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use( express.cookieParser() );
app.use(express.session({ secret: sessionSecret }));
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

var proxy = new httpProxy.RoutingProxy();

//BOSH url for xmpp-http binding
app.all('/http-bind', function(req, res){
    proxy.proxyRequest(req, res, {
        host: 'localhost',
        port: 7070
    });
});

var cats = ['news','politics','sports','music','movies','gadjets','shopping','business','celebrity','technology',
    'science','mathematics','history','religion','online games','arts','astronomy','health/fitness','cartoons/comics',
    'travel/trekking','cars/bikes','pets','casual'];

for(var i = 0; i < cats.length; i++){
    Category.create({name:cats[i]}, function(err){
        if(err) return;
    });
}

//stores user associated with socket
// format {userid : sessionid}
var sessionUsers = [];

//socket.io server init

app.io.route('register', function(req) {
   console.log('registering user: ' + req.data._id);
   req.io.join('' + req.data._id);
});

app.io.route('SEND_CHAT', function(req) {
    console.log('sending chat: ' + req.chat._id + ' to: ' + req.chatuser);
    app.io.room('' + req.chatuser).broadcast('NEW_CHAT', req.chat);
    req.io.respond(req.chat);
});

app.io.route('INIT_CHAT', function(req) {
    console.log('sending chat: ' + req.data.chat._id + ' to: ' + req.data.to);
    req.io.room('' + req.data.to).broadcast('NEW_CHAT', req.data.chat);
});

//Routing
app.get('/', routes.index);
app.get('/partial/login', sessionUtils.notLoggedIn, function (req, res) {
    res.render('partials/login');
});
app.get('/partial/:name', routes.partial);
require('./auth')(app, passport, sessionUsers);
require('./routes/user')(app);
require('./routes/discussion')(app);
require('./routes/chat')(app, sessionUsers);
app.get('*', routes.index);


app.listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});



