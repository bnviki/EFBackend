var UserCtrl = function ($scope, User){
	$scope.allUsers = User.query();
}

UserCtrl.$inject = ['$scope', 'User'];
