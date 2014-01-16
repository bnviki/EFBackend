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

    $scope.editUserDetails = function(){
        $location.path('/complete_profile');
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

function ProfileCtrl($scope, User) {
    $scope.qwerty = function(keys){
        var newUser = new User(keys);
        newUser.$save(function(savedUser){
            console.log('i saved the user: ' + savedUser.username);
        });
    };
}

function CompleteProfile($scope, UserManager, $location, User){
    $scope.currentUser = UserManager.getCurrentUser();
    $('#userid').val($scope.currentUser._id);
    $('#user_name').val($scope.currentUser.username);
    $scope.userinfo = $scope.currentUser;

    $scope.updateUser = function(userinfo){
        if(userinfo.username && userinfo.username.trim() != '')
            $scope.currentUser.displayname = userinfo.displayname.trim();
        if(userinfo.gender)
            $scope.currentUser.gender = userinfo.gender;
        User.save($scope.currentUser);
        $location.path('/dash');
    }

    $scope.isMale = function(){
        return $scope.currentUser.gender == 'M';
    };

}


