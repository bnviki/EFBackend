var RootCtrl = function ($scope, $location, UserManager, $window, $timeout){
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
            $timeout(function(){
                $window.location.href = '/home';
                return true;
            }, 500);
		});
  	}

    $scope.removeAccount = function(){
        if(confirm('Are you sure about deleting this account permanently?')){
            UserManager.removeAccount().then(function(){
                $timeout(function(){
                    $window.location.href = '/home';
                    return true;
                }, 500);
            }, function(){
                alert('error removing your account');
            });
        }
    }

    $scope.search = function(query){
        query = query.trim();
        if(query && query != ''){
            $location.path('/search').search({search: query});
        }
    }
}

RootCtrl.$inject = ['$scope', '$location', 'UserManager', '$window', '$timeout'];

var LoginCtrl = function ($scope, $http, $location, UserManager, $log, User, $timeout, $window){
    var currentUser = UserManager.getCurrentUser();
    if(currentUser != null){
        $location.path('/dash');
    }

    $scope.usertypes = ['Event', 'business/service', 'organisation', 'Individual'];
    //$scope.cats = Category.query();

    $scope.logUserIn = function(user) {
        UserManager.login(user.username.trim(), user.password.trim()).then(function(user){
            $location.path('/dash');
        }, function(error){
            $scope.loginMsg = error;
        });
    }

    $scope.alerts = [];
    $scope.signupUser = function(user){
        if(!user.description || user.description != '')
            user.description = 'Hi there, lets talk';
        var newUser = new User(user);
        newUser.$save(function(savedUser){
            //console.log('i saved the user: ' + savedUser.username);
            alert('An email verification link has been sent to you, please check your mail box and verify.');
            $location.path('/home');
            /*$timeout(function(){
                UserManager.login(savedUser.username, savedUser.password).then(function(userIn){
                    console.log('logged in after signup');
                    $window.location.href = '/home';
                }, function(err){
                    $scope.alerts.push({type:'error', msg: 'user already exists'});
                });
            }, 500);*/
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

LoginCtrl.$inject = ['$scope', '$http', '$location', 'UserManager', '$log', 'User', '$timeout', '$window'];

var ChangePasswordCtrl = function ($scope, $http, $location, UserManager) {
    var currentUser = UserManager.getCurrentUser();
    $scope.changePassword = function(data){
        if(currentUser){
            var changeReq = {oldPassword: data.oldPassword.trim(), newPassword: data.newPassword};
            $http.post('/users/' + currentUser._id + '/changepass', changeReq).success(function(data){
                alert('your password is changed successfully');
                $location.path('/dash');
            },function(err){
                alert('old password is incorrect');
            });
        }
    }
}

ChangePasswordCtrl.$inject = ['$scope', '$http', '$location', 'UserManager'];

var ProfileCtrl = function ($scope) {
    $scope.qwerty = function(keys){
        var newUser = new User(keys);
        newUser.$save(function(savedUser){
            console.log('i saved the user: ' + savedUser.username);
        });
    };
}

ProfileCtrl.$inject = ['$scope'];

var CompleteProfile = function ($scope, UserManager, $location, User){
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

CompleteProfile.$inject = ['$scope', 'UserManager', '$location', 'User'];

