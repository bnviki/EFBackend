var Discussion = require('../data/models/discussion'),
    Category = require('../data/models/category'),
    sessionUtils = require('./middleware/session_utils');

module.exports = function(app) {
	app.get('/discussion', function(req, res) {
	  Discussion.find({}).populate('category created_by interested_users')
	     .exec(function(err, discs) {
		if (err) {
			return next(err);
		}
		res.send(discs);
	  });  
	});

	app.get('/discussion/:id', function(req, res) {
	  Discussion.findOne({_id: req.params.id}).populate('category created_by interested_users')
	     .exec(function(err, disc) {
		if (err) {
			return res.send('Not found', 404);
		}
		if (!disc) {
			return res.send('Not found', 404);
		}
		res.send(disc);
	  });
	});

	app.post('/discussion', function(req, res, next) {
                var newdisc = req.body;
                newdisc.created_by = req.user._id;
		newdisc.interested_users = [req.user._id];		
		Category.findOne({name: req.body.category}, function(err, cat) {
			if (err || !cat) {
				return res.send('invalid category', 400);
			}
			newdisc.category = cat._id;
			var disc = new Discussion(newdisc);
			disc.save(function(err){
				if (err) return res.send('Not found', 404);					
				Discussion.findOne({_id: disc._id}).populate('category created_by interested_users')
	     			.exec(function(err, saveddisc){									
					res.send(saveddisc);
				});									
			});
		});		  
	});

	app.post('/discussion/:id', function(req, res, next) {
	    Discussion.findOne({_id: req.params.id}, function(err, disc) {
		if (err || !disc) {
			return res.send('Not found', 404);
		}
		disc.content = req.body.content;  
		disc.updated_at = Date.now;              
		disc.save(function(err){						
			if (err) return res.send('Not found', 404);					
			Discussion.findOne({_id: disc._id}).populate('category created_by interested_users')
     			.exec(function(err, saveddisc){									
				res.send(saveddisc);
			});
		});  
	    });	  
	});

	app.del('/discussion/:id', function(req, res, next) {
	    Discussion.findOne({_id: req.params.id}, function(err, disc) {
		if (err || !disc) {
			return res.send('Not found', 404);
		}
		
		disc.remove(function(err) {
		  if (err) { return next(err); }
		  res.send('success');
	  	});
	    });
	});

	app.post('/discussion/:id/interested', function(req, res, next) {
	    Discussion.findByIdAndUpdate(req.params.id, { $addToSet: { interested_users: req.body.users }}, function (err, disc) {
  		if (err) return handleError(err);
		res.send(disc);
	    });
	});
}
