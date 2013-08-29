
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , httpProxy = require('http-proxy')
  , path = require('path')
  , passport = require('passport')
  , sessionUtils = require('./routes/middleware/session_utils')
  , Category = require('./data/models/category')
  , xmpp = require('node-xmpp')
  , socketio = require('socket.io');
  
var xmpp_host = 'vikram';
var xmpp_root = 'admin@vikram';

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

var proxy = new httpProxy.RoutingProxy();

app.all('/http-bind', function(req, res){
	proxy.proxyRequest(req, res, {
	    host: 'localhost',
	    port: 7070
	});
});
app.get('/', routes.index);
app.get('/partial/login', sessionUtils.notLoggedIn, function (req, res) {
  res.render('partials/login');
});
app.get('/partial/:name', routes.partial);
require('./auth')(app, passport);
require('./routes/user')(app);
require('./routes/discussion')(app);
require('./routes/chat')(app);
app.get('*', routes.index);

var cats = ['news','politics','sports','music','movies','gadjets','shopping','business','celebrity','technology',
'science','mathematics','history','religion','online games','arts','astronomy','health/fitness','cartoons/comics',
'travel/trekking','cars/bikes','pets','casual'];

for(var i = 0; i < cats.length; i++){
	Category.create({name:cats[i]}, function(err){
		if(err) return;		
	});
}

//xmpp
/*var c = new xmpp.Component({ jid: 'admin@vikram',
			     password: 'muc-secret',
			     host: 'vikram',
			     port: 5270
			   });

c.addListener('online', function() {
	console.log('we are on air');
	var msg = new xmpp.Element('iq', { to: 'ikram', from: 'admin@vikram', id: 'get-user-roster-1', type: 'set'}).
				  c('command', {xmlns: 'http://jabber.org/protocol/commands', action: 'execute', 
					node:'http://jabber.org/protocol/admin#get-user-roster'}).up();
	console.log(msg);
	c.send('monkey');
				  
});

c.on('error', function(err) {
	console.log('we failed' + err);
});

c.on('stanza', function(stanza) {
	  if (stanza.is('message') &&
	      // Important: never reply to errors!
	      stanza.attrs.type !== 'error') {

	      console.log(stanza);
	  }
	console.log('stanza error\n' + stanza);
});*/
	
//xmpp

var server = http.createServer(app);
var io = socketio.listen(server);
server.listen(app.get('port'), function(){
  	console.log('Express server listening on port ' + app.get('port'));	
});

io.sockets.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('myevent', function (data) {
    console.log(data);
  });
});

