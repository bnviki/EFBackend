function MainCtrl($scope, $rootScope) {
  $scope.cats = ['news','politics','sports','music','movies','gadjets','shopping','business','celebrity','technology',
'science','mathematics','history','religion','online games','arts','astronomy','health/fitness','cartoons/comics',
'travel/trekking','cars/bikes','pets','casual'];


  $(function(){
      Candy.init('http-bind/', {
          core: { debug: false, autojoin: ['test@conference.vikram', 'test1@conference.vikram']},
          view: { resources: 'js/candy/res/' }
      });

      Candy.Core.connect('admin@vikram', 'vikram', 'tukki');
      //Candy.Core.Action.Jabber.Room.Join('test@muc.vikram');
  });
  

}
