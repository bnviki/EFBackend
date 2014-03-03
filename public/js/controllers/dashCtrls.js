/**
 * Created with JetBrains WebStorm.
 * User: vikram
 * Date: 25/11/13
 * Time: 6:12 PM
 * To change this template use File | Settings | File Templates.
 */
var DashCtrl = function ($scope, UserManager, ChatClient, $rootScope, User, $location, $http, ChatManager, $routeParams){
    $scope.currentUser = UserManager.getCurrentUser();
    if(!$scope.currentUser){
        $location.path('/');
    }

    //these values are for jquery file upload plugin
    $('#userid').val($scope.currentUser._id);
    $('#user_name').val($scope.currentUser.username);

    if($routeParams.username && $routeParams.username != ''){
        if(!($scope.currentUser && $scope.currentUser.username == $routeParams.username)){
            $http.get('/users', {params:{username: $routeParams.username}}).success(function(users){
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
        //$location.search("");
    }

    $scope.userPicChangeExt = function(){
        var pic = $('#user_picture').val();
        if(pic != $scope.currentUser.picture){
            $scope.currentUser.picture = pic;
            $scope.$apply();
        }
    }

    $scope.updateScrollMsgs = function(){
        if($scope.activeChatMsgs)
            $scope.noOfScrollMsgs = $scope.activeChatMsgs.length;
    };

    $scope.msgs = [];

    $scope.chats = ChatManager.currentChats;
    $scope.activeChat = null;
    $scope.activeChatMsgs = null;
    $scope.unseenChats = {};
    $scope.trackUnseen = false; // used to trigger when to start tracking unseen messages

    $scope.setActiveChat = function(chat){
        $scope.trackUnseen = true;
        $scope.activeChat = chat;
        if(!$scope.msgs[chat.room.toLowerCase() + '@conference.' + ChatClient.host]){
            $scope.msgs[chat.room.toLowerCase() + '@conference.' + ChatClient.host] = [];
        }
        $scope.activeChatMsgs = $scope.msgs[chat.room.toLowerCase() + '@conference.' + ChatClient.host];
        if($scope.unseenChats[chat.room.toLowerCase()])
            $scope.unseenChats[chat.room.toLowerCase()] = false;
    };

    $scope.msgs = ChatManager.msgs;
    //$scope.msgs['pukki@vikram'] = [{from: 'pukki@vikram', to:'vikrambn@vikram', msg: 'hello, thats it'}];
    $scope.noOfScrollMsgs = 0;

    $scope.getToUser = function(chat){
        if(!chat){
            return {displayname: 'none', picture: '/profile/pictures/guest.png'};
        }
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
            if($scope.activeChat.anonymous_chat)
                return '/profile/pictures/guest.png';
            else {
                var picOfUser = $scope.activeChat.users[0].username == fromUser ? $scope.activeChat.users[0] : $scope.activeChat.users[1];
                return picOfUser.picture;
            }
        }
    };

    $scope.sendMsg = function(msg, chat){
        if(msg && msg != ''){
            if(chat)
                ChatClient.sendMsg(msg, chat.room + '@conference.' + ChatClient.host);
            else if($scope.activeChat && $scope.activeChat != null)
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

    $scope.removeChat = function(chat){
        if(confirm('Are you sure about deleting the conversation?')){
            ChatManager.removeChat(chat);
        }
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
        ChatManager.createNewChat(chatreq).then(function(createdChat){
            $scope.sendMsg(newChat.topic, createdChat);
            $('#ChatRequestDialog').modal('hide');
        });
    };

    $rootScope.$on('NewChatMsg', function(event, newmsg){
        $scope.updateScrollMsgs();
        var room = newmsg.from.search('conference') != -1? newmsg.from : newmsg.to;
        room = room.substring(0, room.indexOf('@'));
        if(!($scope.activeChat && $scope.activeChat.room.toLowerCase() == room) && $scope.trackUnseen)
            $scope.unseenChats[room] = true;
    });


    $rootScope.$on('NewChatAdded', function(event, chat){
        if($scope.trackUnseen){
            $scope.unseenChats[chat.room.toLowerCase()] = true;
        }
    });
}

DashCtrl.$inject = ['$scope','UserManager','ChatClient','$rootScope','User','$location','$http','ChatManager','$routeParams'];