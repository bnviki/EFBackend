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


function SignInCtrl($scope, $http, $location, UserManager) {
  $scope.logUserIn = function(user) {
    UserManager.login(user.username, user.password).then(function(user){
	$location.path('/main');
    });    
  }    
}

function SignupCtrl($scope, $resource, User, UserManager, $location){
	$scope.alerts = [];
	$scope.signupUser = function(user){
		User.save(user);
		UserManager.login(user.username, user.password).then(function(user){
			$scope.alerts.push({type:'error', msg: 'user already exists'});
			//$location.path('/main');

		}, function(err){
			$scope.alerts.push({type:'error', msg: 'user already exists'});
		}); 
	}
}

function SignUpExtCtrl($scope, $http, $log){
	$scope.signInGoogle = function(){
		$http.get('/auth/google').success(function(data){
			$log.log("success");
		});
	}	
}

function ProfileCtrl($scope) {
	
}


