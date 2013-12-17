function chatCtrl($scope, $http, $rootScope, UserManager, Messenger){
	var currentUser = UserManager.getCurrentUser();
    $scope.chatReqs = [];

	$http.get('/users/chatrequests').success(function(data){
		console.log('reqs: ' + data);
		$scope.chatReqs = data;
	});

	$scope.acceptReq = function(reqId){
		$http.post('/chat/accept/' + reqId).success(function(chat){	
			$rootScope.addChat(chat);
            removeFromChatReq(reqId);
			console.log('accepted request');
		});	
	}

    function findInChatRequests(id){
        if($scope.chatReqs){
            for(var i = 0; i < $scope.chatReqs.length; i++){
                if($scope.chatReqs[i]._id == id)
                    return true;
            }
        }
        return false;
    }

    function removeFromChatReq(id){
        if($scope.chatReqs){
            for(var i = 0; i < $scope.chatReqs.length; i++){
                if($scope.chatReqs[i]._id == id){
                    $scope.chatReqs.splice(i, 1);
                    break;
                }
            }
        }
    }

    Messenger.socket.on('ADD_CHAT_REQUEST', function (data) {
        console.log('new chat request: ' + data);
        if(!findInChatRequests(data._id)){
            $scope.chatReqs.push(data);
            $scope.$apply();
        }
    });


}
