function discussionCtrl($scope, $http, Discussion, UserManager, Messenger, $rootScope){
 	$scope.cats = ['news','politics','sports','music','movies','gadjets','shopping','business','celebrity','technology',
'science','mathematics','history','religion','online games','arts','astronomy','health/fitness','cartoons/comics',
'travel/trekking','cars/bikes','pets','casual'];

	$scope.createDiscussion = function(disc){
		if(disc.type) disc.type = 'GROUP';
		else disc.type = 'SINGLE';

		Discussion.save(disc);
		$('#createDiscDialog').modal('hide');		
	};

    $scope.needToHideAdd = function(disc){
        var currentUser = UserManager.getCurrentUser();
        if(disc.created_by._id == currentUser._id)
            return true;
        else{
            for(var i = 0; i < disc.interested_users.length; i++){
                if(disc.interested_users[i]._id == currentUser._id)
                    return true;
            }
        }
        return false;
    };

    $scope.needToHideRemove = function(disc){
        var currentUser = UserManager.getCurrentUser();
        if(disc.created_by._id == currentUser._id)
            return true;
        else{
            for(var i = 0; i < disc.interested_users.length; i++){
                if(disc.interested_users[i]._id == currentUser._id)
                    return false;
            }
        }
        return true;
    };

	$scope.addUserToDisc = function(id){
		console.log(id);
        var currentUser = UserManager.getCurrentUser();
		$http.post('/discussion/' + id + '/interested', {users: [currentUser._id]}).success(function(data){
            for(var i = 0; i < $scope.discussions.length; i++){
                if($scope.discussions[i]._id == id)
                    $scope.discussions[i].interested_users.push(currentUser);
            }
            $('#disc_add' + id).hide();
            $('#disc_rem' + id).show();
		});
	};

    $scope.removeUserFromDisc = function(id){
        console.log(id);
        var currentUser = UserManager.getCurrentUser();
        $http.delete('/discussion/' + id + '/interested', {users: [UserManager.getCurrentUser._id]}).success(function(data){
            for(var j = 0; j < $scope.discussions.length; j++){
                if($scope.discussions[j]._id == id){
                    var users = $scope.discussions[j].interested_users;
                    for(var i = 0; i < users.length; i++){
                        if(users[i]._id == currentUser._id)
                            users.splice(i, 1);
                    }
                }
            }
            $('#disc_add' + id).show();
            $('#disc_rem' + id).hide();
        });
    };

    $scope.initiateChat = function(userId, discussionId){
		$http.post('/chat/request', {to: userId, discussion: discussionId}, function(err){
			if(err) console.log('error in chatRequest: ' + err);
		});
	};

    Messenger.socket.on('ADD_DISCUSSION', function(data){
        console.log('recieved new discussion: ' + data);
        if(data){
            $scope.discussions.push(data);
            $scope.$apply();
        }
    });

}
