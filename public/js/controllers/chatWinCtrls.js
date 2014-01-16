/**
 * Created with JetBrains WebStorm.
 * User: vikram
 * Date: 12/11/13
 * Time: 10:45 AM
 * To change this template use File | Settings | File Templates.
 */
function ChatWindowCtrl($scope, $http, $rootScope, UserManager, $routeParams, ChatClient, Messenger, $location, $timeout){
    console.log("routeparams: " + $routeParams.username);

    $scope.chatUser = {};
    $scope.chatUserOnline = false;
    $scope.chatReqSent = null;
    $scope.currentChat = null;
    $scope.userFromURL = $routeParams.username;

    if($routeParams.username && $routeParams.username != ''){
        $http.get('/users', {params:{username:$routeParams.username}}).success(function(data){
            if(data.length > 0){
                $scope.chatUser = data[0];
                $http.get('/plugins/presence/status', {params:{jid:$scope.chatUser.username + '@' + ChatClient.host, type:'xml'}}).success(function(data){
                    console.log('presence: ' + data);
                    if(data.search('unavailable') == -1){
                        $scope.chatUserOnline = true;
                    }
                    else
                        $scope.chatUserOnline = false;
                    $scope.msgs.push({from:'system', msg:'Welcome to mPeers'});
                    $('#UserDetailsDialog').modal('show');
                });
            } else{
                alert($routeParams.username + ' does not seem to exist on mPeers.');
                $location.search('username', null);
                $location.path('/home');
            }
        });
    } else {
        $location.search('username', null);
        $location.path('/home');
    }

    $scope.isSystemMsg = function(msg){
        if(msg.from == 'system')
            return true;
        else
            return false;
    };

    $scope.getPicture = function(from){
        var fromUser = from.substring(0, from.indexOf('@'));
        if(fromUser == $scope.chatUser.username)
            return $scope.chatUser.picture;
        else
            return '/profile/pictures/annonymous.png';
    };

    $scope.msgs = [];
    $scope.noOfScrollMsgs = 0;

    $scope.initChat = function(newChat){
        if(newChat.username != '' && newChat.topic != ''){
            $('init_chat_btn').attr('disabled','disabled');
            if(!$scope.chatUserOnline){
                var msgRequest = {name: newChat.username, msg: newChat.topic};
                $http.post('/users/' + $scope.chatUser._id + '/message', msgRequest).success(function(data){
                    $('#UserDetailsDialog').modal('hide');
                    $scope.msgs.push({from:'system', msg:'your message was sent, contact ' + $scope.chatUser.username + ' later.'});
                });
            } else {
                ChatClient.connect(ChatClient.host, '').then(function(jid){
                    var uname = jid.substring(0, jid.indexOf('@'));
                    Messenger.socket.emit('register', {username: uname});
                    var chatreq = {from: uname, to:$scope.chatUser.username, topic: newChat.topic, username: newChat.username};
                    $http.post('/chat/request', chatreq).success(function(data){
                        $scope.chatReqSent = data;
                        $('#UserDetailsDialog').modal('hide');
                        $scope.msgs.push({from:'system', msg:'waiting for ' + $scope.chatUser.username + ' to join'});
                    });
                });
            }
        }
    }

    $rootScope.$on('NewChatMsg', function(event, newmsg){
        $scope.msgs.push(newmsg);
        $scope.noOfScrollMsgs = $scope.msgs.length;
        //var fromTop = $(".chat-content").scrollTop();
        //$(".chat-content").slimScroll({ scrollTo: fromTop + 'px' });
    });

    $rootScope.$on('NewChatAdded', function(event, chat){
        $scope.currentChat = chat;
        $('#msg-send-button').removeAttr('disabled');
        $scope.msgs.push({from:'system', msg: $scope.chatUser.username + ' has joined, you can chat now ... '});
        console.log('ready for chat');
    });

    $scope.sendMsg = function(msg){
        if(msg && msg != ''){
            ChatClient.sendMsg(msg, $scope.chatUser.username + '@' + ChatClient.host);
            $scope.msgSendText = '';
        }
    }
}