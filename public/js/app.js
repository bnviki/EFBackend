var app = angular.module('mainMod', ['OCServices', 'OCDirectives', 'OCFilters', 'ngRoute', 'ChatServices', 'xeditable', 'ngAutocomplete']).
    config(['$routeProvider', '$locationProvider', '$httpProvider', function($routeProvider, $locationProvider, $httpProvider) {
        $routeProvider.
            when('/home', {templateUrl: 'partial/home', controller: LoginCtrl}).
            when('/signup', {templateUrl: 'partial/signup', controller: LoginCtrl}).
            when('/chatwindow', {templateUrl: 'partial/chatwindow'}).
            when('/admin', {templateUrl: 'partial/adminpage', controller: ProfileCtrl}).
            when('/dash', {templateUrl: 'partial/dash'}).
            when('/search', {templateUrl: 'partial/search', controller: SearchCtrl}).
            when('/changepassword', {templateUrl: 'partial/change_password', controller: ChangePasswordCtrl}).
            when('/setpassword', {templateUrl: 'partial/setpassword', controller: SetNewPasswordCtrl}).
            when('/forgotpass', {templateUrl: 'partial/forgotpass', controller: ChangePasswordCtrl}).
            when('/:username', {templateUrl: 'partial/chatwindow'}).
            otherwise({redirectTo: '/home'});
        $locationProvider.html5Mode(true);

    }]);

app.run(['$rootScope', '$http', '$location', 'UserManager', '$timeout', 'Messenger', 'ChatManager','editableOptions','$route',
    function($rootScope, $http, $location, UserManager, $timeout, Messenger, ChatManager, editableOptions, $route) {
    editableOptions.theme = 'bs3';
    $rootScope.selectedCat = 'news';

    //user login params
    UserManager.checkUser().then(function(){
        //fetch all user chats
        //ChatManager.fetchUserChats();
    });
    $rootScope.isLoggedIn = false;

    $rootScope.$on('event:loginConfirmed', function() {
        var user = UserManager.getCurrentUser();
        Messenger.socket.emit('register', user);
        ChatManager.fetchUserChats();
        $rootScope.isLoggedIn = true;

    });

    $rootScope.$on('event:loggedOut', function() {
        $rootScope.isLoggedIn = false;
    });


    $rootScope.$on('event:loginRequired', function() {
        $location.path('/login');
    });


}]);
