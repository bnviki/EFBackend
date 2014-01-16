
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
    , upload = require('jquery-file-upload-middleware')
    , fs = require('fs')
    , random = require('randomstring')
    , sendMail = require('./routes/middleware/mailer');

    //, socketio = require('socket.io');

var app = express();
app.http().io();

var sessionSecret = 'mycat';

upload.configure({
    uploadDir: __dirname + '/public/uploads',
    uploadUrl: '/uploads',
    imageVersions: {
        thumbnail: {
            width: 80,
            height: 80
        }
    }
});

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon(path.join(__dirname, 'public/img/fav.ico')));
app.use(express.logger('dev'));

app.use('/upload', function (req, res, next) {
    // imageVersions are taken from upload.configure()
    upload.fileHandler({
        uploadDir: function () {
            return __dirname + '/public/profile/pictures';
        },
        uploadUrl: function () {
            return '/profile/pictures';
        }
    })(req, res, next);
});

app.use(express.bodyParser());
app.use(express.methodOverride());
app.use( express.cookieParser() );
app.use(express.session({ secret: sessionSecret }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use(passport.session());
app.use("/public", express.static(__dirname + '/public'));
app.use(app.router);

upload.on('begin', function (fileInfo) {
    var ext = fileInfo.name.substr(fileInfo.name.lastIndexOf('.') + 1);
    var shortid = random.generate(20);
    fileInfo.name = shortid + '.' + ext;
});

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
   console.log('registering user: ' + req.data.username);
   req.io.join('' + req.data.username);
});

//Routing
app.get('/', routes.index);
app.get('/partial/adminpage', routes.adminpage);
app.get('/partial/:name', routes.partial);
require('./auth')(app, passport, sessionUsers);
require('./routes/user')(app);
require('./routes/discussion')(app);
require('./routes/chat')(app, sessionUsers);
app.get("/public", express.static(__dirname + '/public'));
app.get('*', routes.index);


app.listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});



