/**
 * Created with JetBrains WebStorm.
 * User: vikram
 * Date: 10/12/13
 * Time: 11:25 AM
 * To change this template use File | Settings | File Templates.
 */
angular.module('ChatServices', ['ngResource'])
    .factory('ChatClient', ['$http', '$q', '$rootScope', '$location', function($http, $q, $rootScope, $location){
        var chatClient = {};
        chatClient.messages = []; //[{from: "pukki@vikram", msg: "hi!"}];
        chatClient.conn = null;
        chatClient.user = null;
        chatClient.host = 'vikram';
        if($location.host() != 'localhost')
            chatClient.host = 'ip-172-31-9-1';

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
                        to: chatClient.host
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
                    chatClient.conn.addHandler(chatClient.onMsg, null, 'message', 'groupchat');
                    chatClient.conn.addHandler(chatClient.onPresence, null, 'presence');

                    deffered.resolve(jid);
                } else if (status === Strophe.Status.DISCONNECTED) {
                    console.log('disconnected');
                    deffered.reject('cannot connect to xmpp server');
                } else if (status === Strophe.Status.ERROR) {
                    console.log('strophe error');
                    deffered.reject('cannot connect to xmpp server');
                }

            });
            return deffered.promise;
        }

        chatClient.joinRoom = function(roomName, nickName){
            chatClient.conn.send($pres({
                to: roomName + '@conference.' + chatClient.host + '/' + nickName
            }));
        };

        chatClient.onPresence = function(presence){
            var from = $(presence).attr('from');
            var room = Strophe.getBareJidFromJid(from);

            if ($(presence).attr('type') === 'error') {
                // error joining room; reset app
                console.log('error joining room ' + room);
            }
            if ($(presence).attr('type') !== 'error' && from.search('conference') != -1) {
                console.log('room joined ' + room);
            }
            return true;
        };

        chatClient.onMsg = function(message){
            console.log("msg recieved: " + message);
            var jid = $(message).attr('from');

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
            /*this.conn.send($pres({
                to: toUser
            }));*/

            this.conn.send($msg({
                to: toUser,
                "type": "groupchat"
            }).c('body').t(msg));

            /*var newmsg = {from: this.user, to: toUser, msg: msg};
            this.messages.push(newmsg);
            $rootScope.$emit('NewChatMsg', newmsg);*/
        }

        chatClient.disconnect = function(){
            this.conn.disconnect();
        }

        return chatClient;

    }])
    .factory('ChatManager', ['$http', '$rootScope', 'UserManager', 'ChatClient', 'Messenger','$q',
        function($http, $rootScope, UserManager, ChatClient, Messenger, $q){
            var chatManager = {};
            chatManager.currentChats = [];
            chatManager.msgs = [];

            $rootScope.$on('NewChatMsg', function(event, newmsg){
                var room = newmsg.from.search('conference') != -1? newmsg.from : newmsg.to;
                room = room.substring(0, room.indexOf('/'));
                if(!chatManager.msgs[room])
                    chatManager.msgs[room] = [];
                chatManager.msgs[room].push(newmsg);
            });

            chatManager.createNewChat = function(chat){
                var deffered = $q.defer();
                $http.post('/chat', chat).success(function(data){
                    console.log('new chat created' + data._id);
                    chatManager.addChat(data);
                    deffered.resolve(data);
                }).error(function(){
                    deffered.reject('could not create chat');
                });
                return deffered.promise;
            }

            chatManager.addChat = function(chat){
                var i=0;
                var isNew = true;
                for(i=0; i < chatManager.currentChats.length; i++){
                    if(chatManager.currentChats[i]._id == chat._id){
                        isNew = false;
                        break;
                    }
                }
                if(isNew){
                    chatManager.currentChats.push(chat);
                    console.log('joining room ' + chat.room);
                    var nickname = '';
                    if(chat.anonymous_chat && !UserManager.getCurrentUser())
                        nickname = chat.anonymous_user.name;
                    else
                        nickname = UserManager.getCurrentUser().username;
                    ChatClient.joinRoom(chat.room, nickname);
                    $rootScope.$emit('NewChatAdded', chat);
                }
            };

            //get all chats of current user
            chatManager.fetchUserChats = function(){
                var currentUser = UserManager.getCurrentUser();
                $http.get('/users/' + currentUser._id + '/chats').success(function(data, status){
                    if(data){
                        for(var i=0; i<data.length; i++){
                            chatManager.addChat(data[i]);
                        }
                    }
                });
            };

            //check for chats in session .. used for annoymously logged in user
            chatManager.checkForChats = function(){
                $http.get('/chatlive').success(function(data, status){
                    if(data){
                        for(var i=0; i<data.length; i++){
                            chatManager.addChat(data[i]);
                        }
                    }
                });
            };

            chatManager.removeChat = function(chatId){
                $http.post('/chat/' + chatId + '/live').success(function(){
                    console.log('good');
                    for(i=0; i < chatManager.currentChats.length; i++){
                        if(chatManager.currentChats[i]._id == chatId){
                            chatManager.currentChats.splice(i,1);
                            break;
                        }
                    }
                });
            };

            Messenger.socket.on('NEW_CHAT', function (data) {
                //console.log('new chat added: ' + data);
                chatManager.addChat(data);
                $rootScope.$apply();
            });

            return chatManager;
        }]);