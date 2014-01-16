/**
 * Created with JetBrains WebStorm.
 * User: vikram
 * Date: 25/11/13
 * Time: 6:12 PM
 * To change this template use File | Settings | File Templates.
 */
function DashCtrl($scope, UserManager, ChatClient, $rootScope, User, $location, $http, ChatManager){
    $scope.currentUser = UserManager.getCurrentUser();
    if(!$scope.currentUser){
        $location.path('/');
    }

    //$scope.currentUserURL = 'www.mpeers.com/' + $scope.currentUser.username;
    // tabs
    $scope.setActiveWorkspace = function(id){
        if(id == -1){
            $scope.peopleTabActive = true;
            //$('#chat-content').height('100%');
        }
        else{
            $scope.peopleTabActive = false;
            //$('#chat-content').height($(window).height()/2);
        }

        angular.forEach($scope.workspaces, function(workspace) {
            if(workspace.id == id){
                workspace.active = true;
                if($scope.msgs[workspace.userJID])
                    $scope.noOfScrollMsgs = $scope.msgs[workspace.userJID].length;
                else
                    $scope.noOfScrollMsgs = 0;
            }
            else
                workspace.active = false;
        });
    };

    $scope.addNewWorkspace = function(wspace) {
        var id = $scope.wspaceCount + 1;
        wspace.id = id;
        wspace.active = false;
        $scope.workspaces.push(wspace);
        $scope.wspaceCount = $scope.wspaceCount + 1;
        $scope.setActiveWorkspace(wspace.id);
    };

    $scope.removeWorkspace = function(wspace){
        var proceed = confirm('This will end the chat, are you sure?');
        if(proceed){
            var i=0;
            for(i=0; i< $scope.workspaces.length; i++){
                if($scope.workspaces[i].id == wspace.id){
                    ChatManager.removeChat($scope.workspaces[i].chatObj._id);
                    $scope.workspaces.splice(i, 1);
                    break;
                }
            }
            $scope.setActiveWorkspace(-1);
        }
    }

    $scope.getWorkspaceByJID = function(userJid){
        for(var i=0; i< $scope.workspaces.length; i++){
            if($scope.workspaces[i].userJID == userJid){
                return $scope.workspaces[i];
            }
        }
        return null;
    };

    $scope.wspaceCount = 1;
    $scope.workspaces =
        [
            //{ id: 1, name: "Workspace 1", userJID:'', active:true, user: [Object]  }
        ];
    $scope.peopleTabActive = true;
    // tabs

    $scope.updateScrollMsgs = function(){
        var i = 0;
        for(i=0; i< $scope.workspaces.length; i++){
            if($scope.workspaces[i].active){
                $scope.noOfScrollMsgs = $scope.msgs[$scope.workspaces[i].userJID].length;
                break;
            }
        }
    };

    $scope.msgs = [];
    angular.forEach(ChatManager.currentChats, function(chat){
        addChat(chat);
    });
    ChatManager.checkForChats();
    $scope.msgs = ChatManager.msgs;
    //$scope.msgs['pukki@vikram'] = [{from: 'pukki@vikram', to:'vikrambn@vikram', msg: 'hello, thats it'}];
    $scope.noOfScrollMsgs = 0;

    $scope.getPicture = function(from){
        var fromUser = from.substring(0, from.indexOf('@'));
        if(fromUser == $scope.currentUser.username)
            return $scope.currentUser.picture;
        else{
            var userPic = '/profile/pictures/annonymous.png';
            angular.forEach($scope.workspaces, function(workspace) {
                if(workspace.active && workspace.user){
                    userPic = workspace.user.picture;
                }
            });
            return userPic;
        }
    };

    $scope.sendMsg = function(msg){
        if(msg && msg != ''){
            angular.forEach($scope.workspaces, function(workspace) {
                if(workspace.active){
                    ChatClient.sendMsg(msg, workspace.userJID);
                    $scope.msgToSend = '';
                }
            });
        }
    }

    $scope.updateStatus = function(){
        User.save($scope.currentUser);
    }

    $scope.userToChat = null;
    $scope.sendChatRequest = function(user){
        var chatExists = false;
        angular.forEach($scope.workspaces, function(workspace) {
            if(workspace.userJID == user.username + '@' + ChatClient.host){
                chatExists = true;
            }
        });
        if(!chatExists){
            $scope.userToChat = user;
            $http.get('/plugins/presence/status', {params:{jid:$scope.userToChat.username + '@' + ChatClient.host, type:'xml'}}).success(function(data){
                if(data.search('unavailable') == -1){
                    $scope.userToChat.chatUserOnline = true;
                }
                else
                    $scope.userToChat.chatUserOnline = false;
                $('#ChatRequestDialog').modal('show');
            });
        } else {
            alert('A chat window has been already opened for this user');
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

    $scope.initChat = function(newChat){
        if($scope.currentUser.username){
            var chatreq = {from: $scope.currentUser.username, to:$scope.userToChat.username, topic: newChat.topic, username: $scope.currentUser.username};
            $http.post('/chat/request', chatreq).success(function(data){
                $scope.chatReqSent = data;
                $('#ChatRequestDialog').modal('hide');

                // add new chat tab
                var toUser = $scope.userToChat.username;
                var toUserJid = toUser + '@' + ChatClient.host;
                $scope.addNewWorkspace({name: toUser, userJID: toUserJid});
                if(!$scope.msgs[toUserJid])
                    $scope.msgs[toUserJid] = [];
                $scope.msgs[toUserJid].push({from:'system', msg:'waiting for ' + $scope.userToChat.username + ' to join'});
                // add sys msg
                //alert('Chat request sent. A new tab will be added when the other user joins the chat.');
            });
        }
    }

    $rootScope.$on('NewChatMsg', function(event, newmsg){
        $scope.updateScrollMsgs();
    });

    function addChat(chat){
        if($scope.currentUser){
            var toUser = $scope.currentUser.username == chat.users[0] ? chat.users[1]:chat.users[0];
            var toUserWorkspace = $scope.getWorkspaceByJID(toUser + '@' + ChatClient.host);
            if(toUserWorkspace != null){
                $scope.msgs[toUserWorkspace.userJID].push({from:'system', msg: toUserWorkspace.name + ' has joined, you can chat now ... '});
            } else {
                if(chat.username == $scope.currentUser.username)
                    $scope.addNewWorkspace({name: toUser, userJID: toUser + '@' + ChatClient.host, chatObj: chat});
                else
                    $scope.addNewWorkspace({name: chat.username, userJID: toUser + '@' + ChatClient.host, chatObj: chat});
            }

            $http.get('/users', {params:{username: toUser}}).success(function(data){
                if(data.length > 0){
                    var toUserData = data[0];
                    angular.forEach($scope.workspaces, function(workspace) {
                        if(workspace.userJID == toUser + '@' + ChatClient.host){
                            workspace.user = toUserData;
                        }
                    });
                }
            });
        }
    };

    $rootScope.$on('NewChatAdded', function(event, chat){
        addChat(chat)
    });
}