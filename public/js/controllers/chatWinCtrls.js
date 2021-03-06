/**
 * Created with JetBrains WebStorm.
 * User: vikram
 * Date: 12/11/13
 * Time: 10:45 AM
 * To change this template use File | Settings | File Templates.
 */
var ChatWindowCtrl = function ($scope, $http, $rootScope, UserManager, $routeParams, ChatClient, Messenger, $location, ChatManager, $q){
    console.log("routeparams: " + $routeParams.username);

    $scope.chatUser = {};
    $scope.chatUserOnline = false;
    $scope.chatReqSent = null;
    $scope.currentChat = null;
    $scope.userFromURL = $routeParams.username;
    $scope.currentUsername = null;
    var x2js = new X2JS();

    if(UserManager.getCurrentUser()){
        $location.path('/dash').search({username: $routeParams.username});
    }
    else if($routeParams.username && $routeParams.username != ''){
        $http.get('/users', {params:{username:$routeParams.username}}).success(function(data){
            if(data.length > 0){
                $scope.chatUser = data[0];
                $http.get('/plugins/presence/status', {params:{jid:$scope.chatUser.username + '@' + ChatClient.host, type:'xml'}}).success(function(data){
                    console.log('presence: ' + data);
                    $scope.msgs.push({from:'system', msg:'Welcome to mPeers'});

                    var jsonObj = x2js.xml_str2json(data);
                    console.log(jsonObj);

                    if(jsonObj.presence._type == 'unavailable' || jsonObj.presence._type == 'error'){
                        $scope.chatUserOnline = false;
                        $scope.msgs.push({from:'system', msg: $scope.chatUser.offline_message});
                    }
                    else {
                        $scope.chatUserOnline = true;
                        $scope.msgs.push({from:'system', msg: $scope.chatUser.welcome_message});
                    }
                    $('#UserDetailsDialog').modal('show');
                });
            } else{
                alert($routeParams.username + ' does not seem to exist on mPeers.');
                $location.search('username', null);
                $location.path('/home');
            }
        });
    }

    $scope.isSystemMsg = function(msg){
        if(msg.from == 'system')
            return true;
        else
            return false;
    };

    $scope.getPicture = function(from){
        var fromUser = from.substring(from.indexOf('/') + 1, from.indexOf('###'));
        if(fromUser == $scope.chatUser.username)
            return $scope.chatUser.picture;
        else
            return 'http://s3-ap-southeast-1.amazonaws.com/mpeersdata/profile/guest.png';
    };

    $scope.msgs = [];
    $scope.noOfScrollMsgs = 0;

    $scope.checkForUsername = function(){
        if(!$scope.currentUsername || $scope.currentUsername == ''){
            $('#UserDetailsDialog').modal('show');
        }
    }

    $scope.initChat = function(newChat){
        if(newChat.username != '' && newChat.topic != ''){
            $scope.currentUsername = newChat.username;
            $('#init_chat_btn').hide();
            $('#loading-img').show();

            ChatClient.connect(ChatClient.host, '').then(function(jid){
                var uname = jid.substring(0, jid.indexOf('@'));
                Messenger.socket.emit('register', {username: uname});
                var anonymous_user = {name: newChat.username, jid: jid}

                var chatreq = {users:[$scope.chatUser._id], anonymous_chat: true, anonymous_user:{name: newChat.username, jid: jid}};
                ChatManager.createNewChat(chatreq).then(function(){
                    $scope.sendMsg(newChat.topic);
                    $('#UserDetailsDialog').modal('hide');
                });
            });
        }
    }

    $scope.aboutActive = false;

    $rootScope.$on('NewChatMsg', function(event, newmsg){
        var from = newmsg.from.substring(0, newmsg.from.indexOf('/'));
        if(from != ''){
            $scope.msgs.push(newmsg);
            $scope.noOfScrollMsgs = $scope.msgs.length;
            if($('#preventClose') && $('#preventClose').val() == 'true')
                $("html, body").animate({ scrollTop: $(document).height() }, "slow");
        }
        //var fromTop = $(".chat-content").scrollTop();
        //$(".chat-content").slimScroll({ scrollTo: fromTop + 'px' });
    });

    $rootScope.$on('NewChatAdded', function(event, chat){
        $scope.currentChat = chat;
        $('#msg-send-button').removeAttr('disabled');
        $('#msg-send-button-xs').removeAttr('disabled');
        //$scope.msgs.push({from:'system', msg: $scope.chatUser.username + ' has joined, you can chat now ... '});
        console.log('ready for chat');
    });

    $scope.sendMsg = function(msg){
        if(msg && msg != ''){
            ChatClient.sendMsg(msg, $scope.currentChat.room + '@conference.' + ChatClient.host);
            $scope.msgSendText = '';
        }
    }
}

ChatWindowCtrl.$inject = ['$scope','$http','$rootScope','UserManager','$routeParams','ChatClient','Messenger','$location','ChatManager','$q'];