function MainCtrl($scope, $rootScope, $http, UserManager, Discussion) {
  $scope.cats = ['news','politics','sports','music','movies','gadjets','shopping','business','celebrity','technology',
'science','mathematics','history','religion','online games','arts','astronomy','health/fitness','cartoons/comics',
'travel/trekking','cars/bikes','pets','casual'];

    Candy.View.init($('#candy'),  { resources: 'js/candy/res/' });

    Candy.Core.Event.addObserver(Candy.Core.Event.KEYS.CHAT, {update: function(obj, data) {
        if (data.type == 'connection') {
            if (Strophe.Status.CONNECTED == data.status) {
               $rootScope.candyConnected = true;
               $rootScope.$apply();
            } //if
        } //if
    }});

    $scope.catCount = [];
    $scope.$watchCollection('discussions', function(data){
        for(var i = 0; i < data.length; i++){
            if($scope.catCount[data[i].category.name])
                $scope.catCount[data[i].category.name]++;
            else
                $scope.catCount[data[i].category.name] = 1;
        }
    });

    $scope.discussions = Discussion.query();

    $scope.selectedCat = 'news';
    $('#cat_' + $scope.selectedCat).addClass('active')

    $scope.onCatSelected = function(cat){
        $('#cat_' + $scope.selectedCat).removeClass('active')
        $scope.selectedCat = cat;
        $('#cat_' + cat).addClass('active');
    };

}
