function discussionCtrl($scope, Discussion){
 	$scope.cats = ['news','politics','sports','music','movies','gadjets','shopping','business','celebrity','technology',
'science','mathematics','history','religion','online games','arts','astronomy','health/fitness','cartoons/comics',
'travel/trekking','cars/bikes','pets','casual'];

	$scope.createDiscussion = function(disc){
		if(disc.type) disc.type = 'GROUP';
		else disc.type = 'SINGLE';

		Discussion.save(disc);
		$('#createDiscDialog').modal('hide');		
	};

	$scope.discussions = Discussion.query();

	$scope.addUserToDisc = function(id){
		console.log(id);
	};

}
