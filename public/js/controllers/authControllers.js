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
			$location.path('/login');
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
            if(!user.username)
                $location.path('/username');
            else{
                ChatClient.connect(user.username, user.password);
                $location.path('/dash');
            }
        });
    }

    $scope.alerts = [];
    $scope.signupUser = function(user){
        User.save(user);
        UserManager.login(user.username, user.password).then(function(user){
            //$scope.alerts.push({type:'error', msg: 'user already exists'});
            $location.path('/dash');
        }, function(err){
            $scope.alerts.push({type:'error', msg: 'user already exists'});
        });
    }

    $scope.signInGoogle = function(){
        $http.get('/auth/google').success(function(data){
            $log.log("success");
        });
    }
}

function ProfileCtrl($scope) {
	
}

function UserName($scope, UserManager, $location, User){
    var currentUser = UserManager.getCurrentUser();
    if(currentUser == null){
        $location.path('/login');
    }
    else if(currentUser.username){
        $location.path('/dash');
    }

    $scope.setUserName = function(username){
        currentUser.username = username;
        User.save(currentUser);
    }
}


