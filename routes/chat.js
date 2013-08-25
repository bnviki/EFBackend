var ChatRequest = require('../data/models/chatRequest'),
    Chat = require('../data/models/chat'),
    Discussion = require('../data/models/discussion');

module.exports = function(app) {
	app.post('/chat/request', function(req, res) {
	  if(!req.body.from)
		req.body.from = req.user._id;
	  ChatRequest.findOrCreate({from: req.body.from, to: req.body.to}, req.body, function(err, chatRequest){
		if(err){
			res.send('invalid chat request', 400);
		}		
		res.send(chatRequest);
	  }); 
	});

	app.post('/chat/accept/:reqId', function(req, res) {	  
	  ChatRequest.findOne({_id: req.params.reqId}, function(err, chatRequest){
		if(err){
			res.send('invalid chat request', 400);
			return;
		}
		
		if(chatRequest.discussion){
			Discussion.findOne({_id: chatRequest.discussion}, function(error, disc){				
				if(!error && disc.type == 'GROUP'){
					Chat.findOne({discussion: disc._id}, function(err, chat){
						if(err){
							res.send('invalid chat request', 400);
							return;
						}
						chatRequest.remove();
						res.send(chat);
					});
					return;
				}			
			});
		}

		chatRequest.remove();		
		var newChat = { users: [chatRequest.from, chatRequest.to], 
				category: chatRequest.category, 
				discussion: chatRequest.discussion
			      };
		Chat.create(newChat, function(err, chat){
			res.send(chat);
		});	
	  }); 
	});

	app.get('/chat/:id', function(req, res) {
	  Chat.findOne({_id: req.params.id}).populate('category users discussion')
	     .exec(function(err, disc) {
		if (err) {
			return res.send('Not found', 404);
		}		
		res.send(disc);
	  });
	});	
}
