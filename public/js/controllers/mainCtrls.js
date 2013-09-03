function MainCtrl($scope, $rootScope, $http, UserManager) {
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

}
