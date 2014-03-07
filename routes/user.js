/*all routes for /users */

var User = require('../data/models/user'),
    Category = require('../data/models/category'),
    verification = require('../data/models/verificationToken'),
    sendMail = require('./middleware/mailer'),
    sessionUtils = require('./middleware/session_utils'),
    ChatRequest = require('../data/models/chatRequest'),
    Chat = require('../data/models/chat'),
    xmppUser = require('./middleware/xmpp_user'),
    xmpp = require('node-bosh-xmpp-client'),
    http = require('http'),
    s3policy = require('s3policy'),
    random = require('randomstring');;

var s3 = new s3policy('AKIAJFUUM2GSD5FQJ7EA', 'zFj05wkGJPZlRocETz6XBqjIKsXMLy782Po/aCSX');

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

    app.get("/users/:id/chats", function (req, res, next) {
        User.findOne({_id: req.params.id}).exec(function(err, user) {
            if (err) {
                return res.send('Not found', 404);
            }
            Chat.find({users: user._id}).populate('users').exec(function(err, chats){
                if (err) {
                    return res.send('Not found', 404);
                }
                res.send(chats);
            });
        });
    });

    app.get('/users/search', function(req, res) {
        var query = new RegExp(req.query.searchquery, 'i');
        var allUsers = User.find({displayname: query}, function(err, users) {
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

    //Connecting to xmpp server and sending the details to strophe
    app.post('/users/:id/connect', function(req, res) {
        User.findOne({_id: req.params.id}, function(err, user) {
            if (err && !user) {
                return res.send('Not found', 404);
            }

            /*var connection = new xmpp.Client(user.username + '@vikram/dummy', user.password, "http://localhost:5280/http-bind");

             connection.on('online', function() {
             console.log('logged user in to xmpp server');
             console.log('rid: ' + connection.rid);
             res.send({rid: connection.rid, sid: connection.sid, jid: connection.jid});
             });

             connection.on('error', function(e) {
             console.log("xmpp: error " + e);
             });*/

            //console.log('rid: ' + connection.rid);
            res.send('');
        });
    });

    //create new user
    app.post('/users', function(req, res, next) {
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
            /*var vToken = new verification.verificationTokenModel({_userId: user._id});
            vToken.createVerificationToken(function (err, token) {
                if (err) return console.log("Couldn't create verification token", err);
                var verifyURL = req.protocol + "://" + req.get('host') + "/verify/" + token;
                var mail = "Hi "+ user.displayname + ",<br/><br/><p>Please verify your email address by clicking on the link below</p><br/>" +
                    verifyURL;
                sendMail(user.email, "mpeers: verification", null, mail);
            });*/
            //email verification

            var xmppUserCreator = new xmppUser(user);
            xmppUserCreator.createUser();
            xmppUserCreator.on('UserCreated', function(createdUser){
                res.send(user.toJSON());
            });
        });
    });

    // email message to user
    app.post('/users/:id/message', function(req, res, next) {
        User.findOne({_id: req.params.id}, function(err, user) {
            if (err || !user) {
                return res.send('Not found', 404);
            }
            if(req.body && req.body.name && req.body.msg){
                sendMail(user.email, req.body.name + " has left you a message", req.body.msg, null);
                res.send('mail sent', 200);
            } else {
                res.send('failed', 400);
            }
        });
    });

    // update user details
    app.post('/users/:id', sessionUtils.loggedIn, function(req, res, next) {
        var newuser = req.body;
        for (var prop in newuser) {
            if (newuser.hasOwnProperty(prop)) {
                if(prop == 'picture' && newuser[prop].search('http://s3-ap-southeast-1.amazonaws.com/mpeersdata/') == -1)
                    newuser[prop] = 'http://s3-ap-southeast-1.amazonaws.com/mpeersdata/' + newuser[prop];
                req.user[prop] = newuser[prop];
            }
        }

        req.user.save(function(err) {
            if (err) { return next(err); }
            res.send(req.user.toJSON());
        });
    });

    // change password
    app.post('/users/:id/changepass', sessionUtils.loggedIn, function(req, res, next) {
        if (!req.user.validatePassword(req.body.oldPassword)) {
            res.send('incorrect password', 400);
            return;
        }
        req.user.password = req.body.newPassword;
        req.user.save(function(err) {
            if (err) { return next(err); }
            res.send(req.user.toJSON());
        });
    });

    //remove user
    app.post('/users/:id/remove', sessionUtils.loggedIn, function(req, res) {
        http.get({host: 'localhost', port: 9090, path: '/plugins/userService/userservice?type=delete&secret=i5qXQ3Gm&username=' + req.user.username},
            function(response){
                req.user.remove(function(err) {
                    if (err) {
                        res.send('could not find user', 400);
                        return;
                    }
                    req.user = null;
                    res.send('user deleted');
                });
            });
    });

    app.get('/users/:id/uploadpic', function(req, res) {
        User.findOne({_id: req.params.id}, function(err, user) {
            if (err || !user) {
                return res.send('Not found', 404);
            }

            var filename = req.query.fileName;
            var fileExt = filename.substring(filename.indexOf('.'));

            var imageKey = 'profile/' + random.generate(20) + fileExt;
            var policy = s3.writePolicy(imageKey, 'mpeersdata', 120, 10, null, 'image/' + fileExt.substring(1));
            policy.key = imageKey;
            policy.contentType = 'image/' + fileExt.substring(1);
            res.send(policy);
        });
    });

    //email verification callback
    app.get("/verify/:token", sessionUtils.notLoggedIn, function (req, res, next) {
        var token = req.params.token;
        verification.verifyUser(token, function(err) {
            if (err) return res.redirect("/");
            res.redirect("/");
        });
    });
};

