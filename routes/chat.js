var ChatRequest = require('../data/models/chatRequest'),
    Chat = require('../data/models/chat'),
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

	app.post('/chat/accept/:reqId', function(req, res) {	  
	  ChatRequest.findOne({_id: req.params.reqId}, function(err, chatRequest){
          if(err || !chatRequest){
			res.send('invalid chat request', 400);
			return;
		  }

          var sendChatToUser = function(userId, chat){
            console.log('sending chat req to :' + userId + ' session: ' + sessionUsers[userId]);
            //socketCon.sockets.in(sessionUsers[userId]).send('NEW_CHAT', chat);
            req.io.room(''+ userId).broadcast('NEW_CHAT', chat);
          }

          var addChatToSession = function(chat){
              if(!req.session.chats)
                req.session.chats = [];
              req.session.chats.push(chat);
          }

          var newChat = { users: [chatRequest.from, chatRequest.to],
              topic: chatRequest.topic,
              username: chatRequest.username
          };

          /*function getDiscussionChat(discid){
              Discussion.findOne({_id: discid}, function(error, disc){
                  if(error || !disc){
                      return null;
                  }
                  if(disc.type == 'GROUP'){
                      Chat.findOne({discussion: disc._id}, function(err, chat){
                          if(!err && chat){
                              return chat;
                          }
                      });
                  }
                  return null;
              });
          };

          var groupChat = null;
          if(chatRequest.discussion)
              groupChat = getDiscussionChat(chatRequest.discussion);

          if(groupChat != null){
              addChatToSession(chat);
              chatRequest.remove();
              res.send(chat);
              return;
          }*/

          Chat.create(newChat, function(err, chat){
              addChatToSession(chat);
              req.chat = chat;
              req.chatuser = chatRequest.from;
              chatRequest.remove();
              req.io.route('SEND_CHAT');

              //res.send(chat);
          });
          return;
	  });
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

    //socket request handlers
    app.io.route('SEND_CHAT', function(req) {
        console.log('sending chat: ' + req.chat._id + ' to: ' + req.chatuser);
        app.io.room('' + req.chatuser).broadcast('NEW_CHAT', req.chat);
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
