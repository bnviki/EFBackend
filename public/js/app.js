var app = angular.module('mainMod', ['OCServices', 'OCFilters', 'ngRoute', 'ChatServices']).
    config(['$routeProvider', '$locationProvider', '$httpProvider', function($routeProvider, $locationProvider, $httpProvider) {
        $routeProvider.
            when('/home', {templateUrl: 'partial/login', controller: LoginCtrl}).
            when('/chatwindow', {templateUrl: 'partial/chatwindow'}).
            when('/complete_profile', {templateUrl: 'partial/complete_profile'}).
            when('/dash', {templateUrl: 'partial/dash', controller: DashCtrl}).
            when('/demo', {templateUrl: 'partial/demo'}).
            when('/complete_profile', {templateUrl: 'partial/complete_profile'}).
            when('/:username', {redirectTo: '/chatwindow'}).
            otherwise({redirectTo: '/home'});
        $locationProvider.html5Mode(true);

    }]);

app.run(['$rootScope', '$http', '$location', 'UserManager', 'Discussion', '$timeout', 'Messenger',
    function($rootScope, $http, $location, UserManager, Discussion, $timeout, Messenger) {

    $rootScope.selectedCat = 'news';
    //user login params
    UserManager.checkUser();
    $rootScope.isLoggedIn = false;

    $rootScope.$on('event:loginConfirmed', function() {
        var user = UserManager.getCurrentUser();
        Messenger.socket.emit('register', user);
        $rootScope.isLoggedIn = true;

    });

    $rootScope.$on('event:loggedOut', function() {
        $rootScope.isLoggedIn = false;
    });


    $rootScope.$on('event:loginRequired', function() {
        $location.path('/login');
    });

    // currently ongoing chats

    $rootScope.currentChats = [];
    $rootScope.chatCount = 0;

    function findInCurrentChats(id){
        for(var i = 0; i < $rootScope.chatCount; i++){
            if($rootScope.currentChats[i]._id == id)
                return true;
        }
        return false;
    }

    $rootScope.addChat = function(chat){
        if(!findInCurrentChats(chat._id)){
            $rootScope.currentChats.push(chat);
            $rootScope.chatCount = $rootScope.chatCount + 1;
            $rootScope.$emit('NewChatAdded', chat);
        }
    }

    /*$rootScope.$watchCollection('currentChats', function(newChats){
        console.log('changed: ' + newChats);
        if(newChats.length > $rootScope.chatCount){
            var chat = newChats[newChats.length-1];
            var user = UserManager.getCurrentUser();

        }
        $rootScope.chatCount = newChats.length;
    });*/

    // Socket event receivers

    Messenger.socket.on('NEW_CHAT', function (data) {
        console.log('new chat added: ' + data);
        $rootScope.addChat(data);
        $rootScope.$apply();
    });
}]);
