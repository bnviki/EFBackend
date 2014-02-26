/**
 * Created with JetBrains WebStorm.
 * User: vikram
 * Date: 25/2/14
 * Time: 6:45 PM
 * To change this template use File | Settings | File Templates.
 */
function SearchCtrl($scope, UserManager, $routeParams, $http, $location){
    $scope.currentUser = UserManager.getCurrentUser();
    $scope.results = [];

    if($routeParams.search && $routeParams.search != ''){
        $http.get('/users/search', {params:{searchquery: $routeParams.search}}).success(function(users){
            $scope.results = users;
        });
    }

    $scope.sendChatRequest = function(user){
        if(!($scope.currentUser && $scope.currentUser.username == user.username))
            $location.path('/chatwindow').search({username: user.username});
    }
}