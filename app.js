
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
    , xmppCon = require('./routes/middleware/xmpp_conn')
    , xmppUser = require('./routes/middleware/xmpp_user')
    , xmpp = require('node-xmpp')
    , ServiceAdmin = require('node-xmpp-serviceadmin');
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

//presence information
app.get('/plugins/presence/status', function(req, res){
    proxy.proxyRequest(req, res, {
        host: 'localhost',
        port: 9090
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

//Routing
app.get('/', routes.index);
app.get('/partial/:name', routes.partial);
require('./auth')(app, passport, sessionUsers);
require('./routes/user')(app);
require('./routes/discussion')(app);
require('./routes/chat')(app, sessionUsers);
app.get('*', routes.index);


app.listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});



