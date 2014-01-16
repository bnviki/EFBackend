
/*
 * GET home page.
 */

/*module.exports = function(app) {
	app.get('/', function(req, res) {
	  res.render('index', { title: 'mPeers' });
	});
};*/

exports.index = function(req, res){
  res.render('index');
};

exports.partial = function (req, res) {
  var name = req.params.name;
  res.render('partials/' + name);
};

exports.adminpage = function (req, res) {
    if(req.user && req.user.username == 'vikram')
        res.render('partials/adminpage');
    else if(req.user)
        res.render('partials/dash');
    else
        res.render('partials/login');
};
