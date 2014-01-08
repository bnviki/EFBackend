function chatCtrl($scope, $http, $rootScope, UserManager, Messenger, ChatManager){
	var currentUser = UserManager.getCurrentUser();
    $scope.chatReqs = [];

	$http.get('/users/chatrequests').success(function(data){
		//console.log('reqs: ' + data);
        for(var i=0; i < data.length; i++ ){
            var creq = data[i];
            $http.get('/users', {params:{username: creq.from}}).success(function(users){
                if(users.length > 0){
                    var toUserData = users[0];
                    creq.user = toUserData;
                } else{
                    creq.user = {picture: '/profile/pictures/annonymous.png'};
                }
            }).error(function(){
                    creq.user = {picture: '/profile/pictures/annonymous.png'};
            });
        };
		$scope.chatReqs = data;

	});

    $scope.discardReq = function(reqId){
        $http.delete('/chat/request/' + reqId).success(function(){
            removeFromChatReq(reqId);
            console.log('discarded request');
        });
    }

	$scope.acceptReq = function(reqId){
		$http.post('/chat/accept/' + reqId).success(function(chat){	
			ChatManager.addChat(chat);
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

    $scope.getPicture = function(from){

    };

    Messenger.socket.on('ADD_CHAT_REQUEST', function (data) {
        console.log('new chat request: ' + data);
        if(!findInChatRequests(data._id)){
            $scope.chatReqs.push(data);
            $http.get('/users', {params:{username: data.from}}).success(function(users){
                if(users.length > 0){
                    var toUserData = users[0];
                    data.user = toUserData;
                } else{
                    data.user = {picture: '/profile/pictures/annonymous.png'};
                }
            }).error(function(){
                data.user = {picture: '/profile/pictures/annonymous.png'};
            });
            $scope.$apply();
        }
    });


}
