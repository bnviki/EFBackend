function UserCtrl($scope, User){
	$scope.allUsers = User.query();
}
