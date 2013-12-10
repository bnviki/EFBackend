/**
 * Created with JetBrains WebStorm.
 * User: vikram
 * Date: 25/11/13
 * Time: 6:12 PM
 * To change this template use File | Settings | File Templates.
 */
function DashCtrl($scope, UserManager, ChatClient, $rootScope){

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

    var addNewWorkspace = function() {
        var id = $scope.workspaces.length + 1;
        $scope.workspaces.push({
            id: id,
            name: "Workspace " + id,
            active: true
        });
    };

    $scope.workspaces =
        [
            { id: 1, name: "Workspace 1", user:'pukki@vikram', active:true  },
            { id: 2, name: "Workspace 2", user:'vikrambn@vikram', active:false }
        ];

    $scope.addWorkspace = function () {
        setAllInactive();
        addNewWorkspace();
    };
    // tabs

    $scope.msgs = [];
    $scope.msgs['pukki@vikram'] = [{from: 'pukki@vikram', msg: 'hello, thats it'}];

    //login current user
    var currentUser = UserManager.getCurrentUser();
    if(currentUser){
        ChatClient.connect(currentUser.username + '@vikram', currentUser.password);
    }


    $scope.sendMsg = function(user, msg){
        ChatClient.sendMsg(msg, user);
    }

    $rootScope.$on('NewChatMsg', function(event, newmsg){
        if(!$scope.msgs[newmsg.from])
            $scope.msgs[newmsg.from] = [];

        $scope.msgs[newmsg.from].push(newmsg);
        $scope.$apply();
    });
}