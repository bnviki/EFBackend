/**
 * Created with JetBrains WebStorm.
 * User: vikram
 * Date: 12/11/13
 * Time: 10:45 AM
 * To change this template use File | Settings | File Templates.
 */
function ChatWindowCtrl($scope, $http, $rootScope, UserManager, $routeParams, ChatClient, Messenger){
    console.log("routeparams: " + $routeParams.username);

    $scope.chatUser = {};
    $scope.chatUserStatus = 'unavailable';
    $scope.chatReqSent = null;
    $scope.currentChat = null;

    if($routeParams.username && $routeParams.username != ''){
        $http.get('/users', {params:{username:$routeParams.username}}).success(function(data){
            if(data.length > 0){
                $scope.chatUser = data[0];
                $http.get('/plugins/presence/status', {params:{jid:$scope.chatUser.username + '@vikram', type:'xml'}}).success(function(data){
                    console.log('presence: ' + data);
                    if(data.search('unavailable') == -1){
                        $scope.chatUserStatus = 'online';
                        $('#UserDetailsDialog').modal('show');
                    }
                    else
                        $scope.chatUserStatus = 'unavailable';
                });
            }
        });
    }

    $scope.msgs = [];

    $scope.initChat = function(newChat){
        ChatClient.connect('vikram', '').then(function(jid){
            var uname = jid.substring(0, jid.indexOf('@'));
            Messenger.socket.emit('register', {username: uname});
            var chatreq = {from: uname, to:$scope.chatUser.username, topic: newChat.topic, username: newChat.username};
            $http.post('/chat/request', chatreq).success(function(data){
                $scope.chatReqSent = data;
                $('#UserDetailsDialog').modal('hide');
            });
        });
    }

    $rootScope.$on('NewChatMsg', function(event, newmsg){
        $scope.msgs.push(newmsg);
    });

    $rootScope.$on('NewChatAdded', function(event, chat){
        $scope.currentChat = chat;
        console.log('ready for chat');
    });

    $scope.sendMsg = function(msg){
        ChatClient.sendMsg(msg, $scope.chatUser.username + '@vikram');
    }
}