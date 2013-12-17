/**
 * Created with JetBrains WebStorm.
 * User: vikram
 * Date: 25/11/13
 * Time: 6:12 PM
 * To change this template use File | Settings | File Templates.
 */
function DashCtrl($scope, UserManager, ChatClient, $rootScope){
    $scope.currentUser = UserManager.getCurrentUser();
    // tabs
    var setAllInactive = function() {
        angular.forEach($scope.workspaces, function(workspace) {
            workspace.active = false;
        });
    };

    $scope.setActiveWorkspace = function(id){
        angular.forEach($scope.workspaces, function(workspace) {
            if(workspace.id == id)
                workspace.active = true;
            else
                workspace.active = false;
        });
    }

    $scope.addNewWorkspace = function(wspace) {
        setAllInactive();
        var id = $scope.wspaceCount + 1;
        wspace.id = id;
        wspace.active = true;
        $scope.workspaces.push(wspace);
        $scope.wspaceCount = $scope.wspaceCount + 1;
    };

    $scope.wspaceCount = 1;
    $scope.workspaces =
        [
            { id: 1, name: "Workspace 1", user:'', active:true  }
        ];

    // tabs

    $scope.msgs = [];
    $scope.msgs['pukki@vikram'] = [{from: 'pukki@vikram', to:'vikrambn@vikram', msg: 'hello, thats it'}];

    var currentUser = UserManager.getCurrentUser();

    $scope.sendMsg = function(user, msg){
        ChatClient.sendMsg(msg, user);
        $('.chat-send-form textarea').text = '';
    }

    $rootScope.$on('NewChatMsg', function(event, newmsg){
        if(newmsg.from == ChatClient.user){
            if(!$scope.msgs[newmsg.to])
                $scope.msgs[newmsg.to] = [];
            $scope.msgs[newmsg.to].push(newmsg);
        } else {
            if(!$scope.msgs[newmsg.from])
                $scope.msgs[newmsg.from] = [];

            $scope.msgs[newmsg.from].push(newmsg);
        }
    });

    $rootScope.$on('NewChatAdded', function(event, chat){
        if(currentUser){
            var toUser = currentUser.username == chat.users[0] ? chat.users[1]:chat.users[0];
            $scope.addNewWorkspace({name: chat.username, user: toUser + '@vikram'});
        }
    });
}