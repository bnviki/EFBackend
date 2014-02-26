function RootCtrl($scope, $location, UserManager, $window){
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
            $window.location.href = '/home';
		});
  	}

    $scope.editUserDetails = function(){
        //$location.path('/complete_profile');
    }

    $scope.search = function(query){
        query = query.trim();
        if(query && query != ''){
            $location.path('/search').search({search: query});
        }
    }
}

function LoginCtrl($scope, $http, $location, UserManager, $log, User, ChatClient){
    var currentUser = UserManager.getCurrentUser();
    if(currentUser != null){
        $location.path('/dash');
    }

    $scope.usertypes = ['Event', 'business/service', 'organisation', 'Individual'];
    //$scope.cats = Category.query();

    $scope.logUserIn = function(user) {
        UserManager.login(user.username, user.password).then(function(user){
            //if(!user.signup_complete)
            //    $location.path('/complete_profile');
            //else{
                $location.path('/dash');
            //}
        });
    }

    $scope.alerts = [];
    $scope.signupUser = function(user){
        if(!user.description || user.description != '')
            user.description = 'Hi there, lets talk';
        var newUser = new User(user);
        newUser.$save(function(savedUser){
            //console.log('i saved the user: ' + savedUser.username);
            UserManager.login(savedUser.username, savedUser.password).then(function(userIn){
                console.log('logged in after signup');
            }, function(err){
                $scope.alerts.push({type:'error', msg: 'user already exists'});
            });
        });
    }

    $scope.signInGoogle = function(){
        $http.get('/auth/google').success(function(data){
            $log.log("success");
        });
    }

    $scope.cancelSignup = function(){
        $location.path('/home');
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


