var ChatRequest = require('../data/models/chatRequest'),
    Chat = require('../data/models/chat'),
    User = require('../data/models/user'),
    xmpp_room = require('./middleware/xmpp_room'),
    Discussion = require('../data/models/discussion');

module.exports = function(app, sessionUsers) {
    app.post('/chat/request', function(req, res) {
        if(!req.body.from)
            req.body.from = req.user._id;
        ChatRequest.findOrCreate({from: req.body.from, to: req.body.to}, req.body, function(err, chatRequest){
            if(err){
                res.send('invalid chat request', 400);
            }

            req.chatrequest = chatRequest;
            req.io.route('SEND_CHAT_REQUEST');
            //res.send(chatRequest);
        });
    });

    app.del('/chat/request/:reqId', function(req, res){
        ChatRequest.findOne({_id: req.params.reqId}, function(err, chatRequest){
            if(err || !chatRequest){
                res.send('invalid chat request', 400);
                return;
            }

            chatRequest.remove(function(err) {
                if (err){
                    res.send('invalid chat request', 400);
                }
                res.send('success');
            });
        });
    });

    /*
     req.body should contain
     {
     ann_user: {name, jid}
     users: [_id]
     }
     */
    app.post('/chat', function(req, res) {
        var addChatToSession = function(chat){
            if(!req.session.chats)
                req.session.chats = [];
            req.session.chats.push(chat);
        }

        var newChat = {};
        if(req.body.anonymous_user){
            newChat.anonymous_user = req.body.anonymous_user;
            newChat.anonymous_chat = true;
        }
        newChat.users = req.body.users;

        //check if chat already exists between 2 users
        if(req.body.users.length > 1){
            Chat.findOne({users: {'$in': [req.body.users[0]._id, req.body.users[1]._id]}})
                .exec(function(err, chat){
                    if(err){
                        Chat.create(newChat, function(err, chat){
                            var xmppRoomCreator = new xmpp_room(chat.room, 'admin');
                            xmppRoomCreator.createRoom();
                            xmppRoomCreator.on('RoomCreated', function(roomName){
                                addChatToSession(chat);
                                req.chat = chat;
                                req.chatusers = req.body.users;
                                req.io.route('SEND_CHAT');
                            });
                        });
                    }
                    else if(!err && chat){
                        req.chat = chat;
                        req.chatusers = chat.users;
                        req.io.route('SEND_CHAT');
                    }
                });
        } else {
            //todo: check if all users exist before chat creation
            Chat.create(newChat, function(err, chat){
                var xmppRoomCreator = new xmpp_room(chat.room, 'admin');
                xmppRoomCreator.createRoom();
                xmppRoomCreator.on('RoomCreated', function(roomName){
                    addChatToSession(chat);
                    req.chat = chat;
                    req.chatusers = req.body.users;
                    req.io.route('SEND_CHAT');
                });
            });
        }

    });

    app.get('/chat/:id', function(req, res) {
        Chat.findOne({_id: req.params.id})
            .exec(function(err, chat) {
                if (err) {
                    return res.send('Not found', 404);
                }
                res.send(chat);
            });
    });

    app.get('/chatlive', function(req, res) {
        if(req.session.chats){
            res.send(req.session.chats);
        } else {
            res.send('no ongoing chats', 204);
        }
    });

    app.post('/chat/:id/live', function(req, res) {
        Chat.findOne({_id: req.params.id})
            .exec(function(err, chat) {
                if (err) {
                    return res.send('Not found', 404);
                }
                if(req.session.chats){
                    var i = 0;
                    for(i=0; i < req.session.chats.length; i++){
                        if(req.session.chats[i]._id == chat._id){
                            req.session.chats.splice(i,1);
                            break;
                        }
                    }
                    req.session.save();
                }
                chat.remove(function(err) {
                    if (err){
                        res.send('invalid chat request', 400);
                    }
                    res.send('success');
                });
            });
    });

    //socket request handlers
    app.io.route('SEND_CHAT', function(req) {
        console.log('sending chat: ' + req.chat._id);
        for(usr in req.chatusers)
            app.io.room('' + usr).broadcast('NEW_CHAT', req.chat);
        req.io.respond(req.chat);
    });

    app.io.route('SEND_CHAT_REQUEST', function(req) {
        console.log('sending chat request: ' + req.chatrequest._id + ' to: ' + req.chatrequest.to);
        app.io.room('' + req.chatrequest.to).broadcast('ADD_CHAT_REQUEST', req.chatrequest);
        req.io.respond(req.chatrequest);
    });

    app.io.route('INIT_CHAT', function(req) {
        console.log('sending chat: ' + req.data.chat._id + ' to: ' + req.data.to);
        req.io.room('' + req.data.to).broadcast('NEW_CHAT', req.data.chat);
    });
}
