/**
 * Created with JetBrains WebStorm.
 * User: vikram
 * Date: 25/11/13
 * Time: 6:12 PM
 * To change this template use File | Settings | File Templates.
 */
function DashCtrl($scope, UserManager, ChatClient, $rootScope, User, $location, $http, ChatManager, $routeParams){
    $scope.currentUser = UserManager.getCurrentUser();
    if(!$scope.currentUser){
        $location.path('/');
    }

    $scope.updateScrollMsgs = function(){
        if($scope.activeChatMsgs)
            $scope.noOfScrollMsgs = $scope.activeChatMsgs.length;
    };

    $scope.msgs = [];

    $scope.chats = ChatManager.currentChats;
    $scope.activeChat = null;
    $scope.activeChatMsgs = null;

    $scope.setActiveChat = function(chat){
        $scope.activeChat = chat;
        $scope.activeChatMsgs = $scope.msgs[chat.room.toLowerCase() + '@conference.' + ChatClient.host];
    };

    $scope.msgs = ChatManager.msgs;
    //$scope.msgs['pukki@vikram'] = [{from: 'pukki@vikram', to:'vikrambn@vikram', msg: 'hello, thats it'}];
    $scope.noOfScrollMsgs = 0;

    $scope.getToUser = function(chat){
        if(chat.users.length > 1){
            return chat.users[0]._id == $scope.currentUser._id ? chat.users[1] : chat.users[0];
        } else {
            var anonUser = {displayname: chat.anonymous_user.name, picture: '/profile/pictures/guest.png'}
            return anonUser;
        }
    };

    $scope.getPicture = function(from){
        var fromUser = from.substring(from.indexOf('/') + 1);
        if(fromUser == $scope.currentUser.username)
            return $scope.currentUser.picture;
        else{
            $http.get('/users', {params:{username: from}}).success(function(users){
                if(users.length > 0)
                    return users[0].picture;
                else
                    return '/profile/pictures/guest.png';
            });
            return userPic;
        }
    };

    $scope.sendMsg = function(msg){
        if(msg && msg != '' && $scope.activeChat != null){
            ChatClient.sendMsg(msg, $scope.activeChat.room + '@conference.' + ChatClient.host);
            $scope.msgToSend = '';
        }
    }

    $scope.updateStatus = function(){
        User.save($scope.currentUser);
    }

    $scope.userToChat = null;


    $scope.sendChatRequest = function(username){
        $http.get('/users', {params:{username: username}}).success(function(users){
            if(users.length > 0){
                $scope.userToChat = users[0];
                $http.get('/plugins/presence/status', {params:{jid:$scope.userToChat.username + '@' + ChatClient.host, type:'xml'}}).success(function(data){
                    if(data.search('unavailable') == -1){
                        $scope.userToChat.chatUserOnline = true;
                    }
                    else
                        $scope.userToChat.chatUserOnline = false;
                    $('#ChatRequestDialog').modal('show');
                });
            }
        });
    }


    $scope.editUserDetails = function(){
        $location.path('/complete_profile');
    }

    $scope.isSystemMsg = function(msg){
        if(msg.from == 'system')
            return true;
        else
            return false;
    };

    $scope.createNewChat = function(newChat){
        var chatreq = {users:[$scope.currentUser._id, $scope.userToChat._id], anonymous_chat: false};
        ChatManager.createNewChat(chatreq);
        $('#ChatRequestDialog').modal('hide');
    };

    $rootScope.$on('NewChatMsg', function(event, newmsg){
        $scope.updateScrollMsgs();
    });


    $rootScope.$on('NewChatAdded', function(event, chat){
        //highlight new chat
    });

    if($routeParams.username && $routeParams.username != ''){
        $scope.sendChatRequest($routeParams.username);
    }
}