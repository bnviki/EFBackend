function userCtrl($scope, User){
	$scope.allUsers = User.query();
}
