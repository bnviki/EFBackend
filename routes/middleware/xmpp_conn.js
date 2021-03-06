/**
 * Created with JetBrains WebStorm.
 * User: vikram
 * Date: 19/11/13
 * Time: 4:20 PM
 * To change this template use File | Settings | File Templates.
 */
var xmpp = require('node-xmpp');
var os = require('os');

var hostname = os.hostname();
var adminJid = "mpeers_admin@" + hostname;
var adminPass = "mpeers";

var xmpp_connection = {
    getConnection : function(){
        return connection;
    }
};

var connection = new xmpp.Client({
    jid: adminJid,
    password: adminPass,
    host: 'localhost'
});

connection.connection.socket.setKeepAlive(true, 10000);

connection.on('error', function(e) {
    console.log("xmpp: error " + e);
});

connection.on('online', function() {
    console.log('xmpp: online, initialised');
    connection.send(new xmpp.Element('presence', { })
        .c('show').t('chat').up()
        .c('status').t('administrator is here')
    );
});

var period = 10000; // 10 second
setInterval(function() {
    connection.send(new xmpp.Element('presence', { })
        .c('show').t('chat').up()
        .c('status').t('administrator is here')
    );
}, period);

module.exports = xmpp_connection;