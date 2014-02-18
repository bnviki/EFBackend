var app = angular.module('mainMod', ['OCServices', 'OCDirectives', 'OCFilters', 'ngRoute', 'ChatServices', 'xeditable']).
    config(['$routeProvider', '$locationProvider', '$httpProvider', function($routeProvider, $locationProvider, $httpProvider) {
        $routeProvider.
            when('/home', {templateUrl: 'partial/login', controller: LoginCtrl}).
            when('/signup', {templateUrl: 'partial/signup', controller: LoginCtrl}).
            when('/chatwindow', {templateUrl: 'partial/chatwindow'}).
            when('/admin', {templateUrl: 'partial/adminpage', controller: ProfileCtrl}).
            when('/dash', {templateUrl: 'partial/dash', controller: DashCtrl}).
            when('/complete_profile', {templateUrl: 'partial/complete_profile'}).
            when('/:username', {redirectTo: '/chatwindow'}).
            otherwise({redirectTo: '/home'});
        $locationProvider.html5Mode(true);

    }]);

app.run(['$rootScope', '$http', '$location', 'UserManager', 'Discussion', '$timeout', 'Messenger', 'ChatManager','editableOptions',
    function($rootScope, $http, $location, UserManager, Discussion, $timeout, Messenger, ChatManager, editableOptions) {
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
