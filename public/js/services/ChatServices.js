/**
 * Created with JetBrains WebStorm.
 * User: vikram
 * Date: 10/12/13
 * Time: 11:25 AM
 * To change this template use File | Settings | File Templates.
 */
angular.module('ChatServices', ['ngResource'])
  .factory('ChatClient', ['$http', '$q', '$rootScope', function($http, $q, $rootScope){
    var chatClient = {};
    chatClient.messages = [{from: "pukki@vikram", msg: "hi!"}];
    chatClient.conn = null;
    chatClient.user = null;

    chatClient.connect = function(username, password){
        var deffered = $q.defer();
        if(!password || password == '')
            password = username.substring(0, username.indexOf('@'));

        this.conn = new Strophe.Connection('http-bind/');
        this.conn.connect(username, password, function (status) {
            if (status === Strophe.Status.CONNECTED) {
                console.log("strophe connected");
                var jid = Strophe.getBareJidFromJid(chatClient.conn.jid);
                chatClient.user = jid;
                chatClient.conn.send($pres({
                    to: 'vikram'
                }));

                /*chatClient.conn.xmlInput = function (xml) {
                    console.log('Incoming:');
                    console.log(xml);
                };
                chatClient.conn.xmlOutput = function (xml) {
                    console.log('Outgoing:');
                    console.log(xml);
                };*/

                chatClient.conn.addHandler(chatClient.onMsg, null, 'message', 'chat');
                deffered.resolve(jid);
            } else if (status === Strophe.Status.DISCONNECTED) {
                console.log('disconnected');
                deffered.reject('cannot connect to xmpp server');
            }
        });
        return deffered.promise;
    }

    chatClient.onMsg = function(message){
        console.log("msg recieved: " + message);
        var jid = Strophe.getBareJidFromJid($(message).attr('from'));

        var body = $(message).find("html > body");
        if (body.length === 0) {
            body = $(message).find('body');
            if (body.length > 0) {
                body = body.text()
            } else {
                body = null;
            }
        } else {
            body = body.contents();
        }
        if (body) {
            var newmsg = {from: jid, to: chatClient.user, msg: body};
            chatClient.messages.push(newmsg);
            $rootScope.$emit('NewChatMsg', newmsg);
            $rootScope.$apply();
        }
        return true;
    };

    chatClient.sendMsg = function(msg, toUser){
        this.conn.send($pres({
            to: toUser
        }));

        this.conn.send($msg({
            to: toUser,
            "type": "chat"
        }).c('body').t(msg));

        var newmsg = {from: this.user, to: toUser, msg: msg};
        this.messages.push(newmsg);
        $rootScope.$emit('NewChatMsg', newmsg);
    }

    chatClient.disconnect = function(){
        this.conn.disconnect();
    }

    return chatClient;

}]);