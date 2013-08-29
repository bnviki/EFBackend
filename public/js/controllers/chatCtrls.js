function chatCtrl($scope, $http, $rootScope, UserManager){
	var currentUser = UserManager.getCurrentUser();
	console.log('inside chatCtrl');
	$http.get('/users/chatrequests').success(function(data){
		console.log('reqs: ' + data);
		$scope.chatReqs = data;
	});

	$scope.acceptReq = function(reqId){
		$http.post('/chat/accept/' + reqId).success(function(chat){	
			$rootScope.currentChats.push(chat);		
			console.log('accepted request');
		});	
	}	
}
