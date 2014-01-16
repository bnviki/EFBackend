var nodemailer = require("nodemailer")

var smtpTransport = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: "admin@mpeers.com",
        pass: "mpeersadmin"
    }
});

var sendMail = function(toAdd, mailSubject, mailText, mailHtml){
	var mailOptions = {
	    from: 'mPeers <admin@mpeers.com>',
	    to: toAdd,
	    subject: mailSubject,
	    text: mailText,
	    html: mailHtml
	}


	smtpTransport.sendMail(mailOptions, function(error, response){
	    if(error){
		console.log(error);
	    }else{
		console.log("Message sent: " + response.message);
	    }

	    // if you don't want to use this transport object anymore, uncomment following line
	    //smtpTransport.close(); // shut down the connection pool, no more messages
	});
}

module.exports = sendMail


