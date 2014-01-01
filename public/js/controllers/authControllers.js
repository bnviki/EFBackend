function RootCtrl($scope, $location, UserManager){
	$scope.currentUser = UserManager.getCurrentUser();
	$scope.isLoggedIn = UserManager.isLoggedIn();
	
	$scope.$on('event:loginConfirmed', function(event, user){
		$scope.isLoggedIn = true;
		$scope.currentUser = user;
  	});

	$scope.$on('event:loggedOut', function(event){
		$scope.isLoggedIn = false;
		$scope.currentUser = null;
  	});

	$scope.logUserOut = function(){
		UserManager.logout().then(function(){
			$location.path('/home');
		});
  	}
}

function LoginCtrl($scope, $http, $location, UserManager, $log, User, ChatClient){
    var currentUser = UserManager.getCurrentUser();
    if(currentUser != null){
        $location.path('/dash');
    }

    $scope.logUserIn = function(user) {
        UserManager.login(user.username, user.password).then(function(user){
            if(!user.signup_complete)
                $location.path('/complete_profile');
            else{
                $location.path('/dash');
            }
        });
    }

    $scope.alerts = [];
    $scope.signupUser = function(user){
        //coming soon
    }

    $scope.signInGoogle = function(){
        $http.get('/auth/google').success(function(data){
            $log.log("success");
        });
    }
}

function ProfileCtrl($scope) {
	
}

function CompleteProfile($scope, UserManager, $location, User){
    var currentUser = UserManager.getCurrentUser();
    $('#userid').val(currentUser._id);
    $('#user_name').val(currentUser.username);
    /*if(currentUser == null){
        $location.path('/login');
    }
    else if(currentUser.username){
        $location.path('/dash');
    } */

    $scope.updateUser = function(userinfo){
        if(userinfo.username && userinfo.username.trim() != '')
            currentUser.displayname = userinfo.username.trim();
        if(userinfo.gender)
            currentUser.gender = userinfo.gender;
        User.save(currentUser);
        $location.path('/dash');
    }


}


