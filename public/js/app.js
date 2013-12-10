var app = angular.module('mainMod', ['OCServices', 'OCFilters', 'ngRoute', 'ChatServices']).
    config(['$routeProvider', '$locationProvider', '$httpProvider', function($routeProvider, $locationProvider, $httpProvider) {
        $routeProvider.
            when('/login', {templateUrl: 'partial/login', controller: LoginCtrl}).
            when('/chatwindow', {templateUrl: 'partial/chatwindow'}).
            when('/username', {templateUrl: 'partial/username'}).
            when('/dash', {templateUrl: 'partial/dash', controller: DashCtrl}).
            when('/main', {templateUrl: 'partial/main',  reloadOnSearch: false}).
            when('/demo', {templateUrl: 'partial/demo'}).
            when('/profile/:username', {redirectTo: '/chatwindow'});
            //otherwise({redirectTo: '/login'});
        $locationProvider.html5Mode(true);

        var interceptor = ['$rootScope','$q', function(scope, $q) {
            function success(response) {
                return response;
            }

            function error(response) {
                var status = response.status;

                if (status == 401) {
                    var deferred = $q.defer();
                    var req = {
                        config: response.config,
                        deferred: deferred
                    }
                    scope.requests401.push(req);
                    scope.$broadcast('event:loginRequired');
                    return deferred.promise;
                }
                // otherwise
                return $q.reject(response);

            }

            return function(promise) {
                return promise.then(success, error);
            }

        }];
        $httpProvider.responseInterceptors.push(interceptor);
    }]);

app.run(['$rootScope', '$http', '$location', 'UserManager', 'Discussion', '$timeout', 'Messenger',
    function($rootScope, $http, $location, UserManager, Discussion, $timeout, Messenger) {

    $rootScope.selectedCat = 'news';
    //user login params
    UserManager.checkUser();
    $rootScope.isLoggedIn = false;


    /**
     * Holds all the requests which failed due to 401 response.
     */
    $rootScope.requests401 = [];

    /**
     * On 'event:loginConfirmed', resend all the 401 requests.
     */
    $rootScope.$on('event:loginConfirmed', function() {
        var user = UserManager.getCurrentUser();
        Messenger.socket.emit('register', user);
        $rootScope.isLoggedIn = true;

        /*var i, requests = scope.requests401;
         for (i = 0; i < requests.length; i++) {
         retry(requests[i]);
         }
         scope.requests401 = [];

         function retry(req) {
         $http(req.config).then(function(response) {
         req.deferred.resolve(response);
         //scope.$digest();
         });
         } */
    });

    $rootScope.$on('event:loggedOut', function() {
        $rootScope.isLoggedIn = false;
    });

    /**
     * On 'event:loginRequest' send credentials to the server.
     */
    /*scope.$on('event:loginRequest', function(event, username, password) {
     var payload = $.param({j_username: username, j_password: password});
     var config = {
     headers: {'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8'}
     }
     $http.post('j_spring_security_check', payload, config).success(function(data) {
     if (data === 'AUTHENTICATION_SUCCESS') {
     scope.$broadcast('event:loginConfirmed');
     }
     });
     });*/

    /**
     * On 'logoutRequest' invoke logout on the server and broadcast 'event:loginRequired'.
     */
    /*$rootScope.$on('event:logoutRequest', function() {
        $http.put('j_spring_security_logout', {}).success(function() {
            ping();
        });
    });*/

    $rootScope.$on('event:loginRequired', function() {
        $location.path('/login');
    });

    /**
     * Ping server to figure out if user is already logged in.
     */
    /*function ping() {
     $http.get('rest/ping').success(function() {
     scope.$broadcast('event:loginConfirmed');
     });
     }
     ping();*/

//candy init
    /*Candy.init('http-bind/', {
     core: { debug: true},
     view: { resources: 'js/candy/res/' }
     });*/

    /*Candy.Core.init('http-bind/', { debug: true});
    $rootScope.candyConnected = false;

    $rootScope.$watch('candyConnected', function(newVal, oldVal){
        if($rootScope.candyConnected) {
            $http.get('/users/chats').success(function(chats){
                for(var i= 0; i < chats.length; i++)
                    $rootScope.currentChats.push(chats[i]);
            });
        }
    });

    $rootScope.$watch('isLoggedIn', function(newVal, oldVal){
        if($rootScope.isLoggedIn) {
            var user = UserManager.getCurrentUser();
            Candy.Core.connect('vikram', null, user.displayname);
        } else {
            Candy.Core.disconnect();
            $('#candy').hide();
            $('#noChats').show();
        }
    });*/


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

    $rootScope.$watchCollection('currentChats', function(newChats){
        console.log('changed: ' + newChats);
        if(newChats.length > $rootScope.chatCount){
            var chat = newChats[newChats.length-1];
            var user = UserManager.getCurrentUser();
            var roomId = chat.room;
            $('#noChats').hide();
            $('#candy').show();
            Candy.Core.Action.Jabber.Room.Join(roomId + "@conference.vikram");

            $http.get('/discussion/' + chat.discussion).success(function(disc){
                if(disc.type == 'SINGLE'){
                    $timeout(function(){
                        var toUser = chat.users[0] == user._id ? chat.users[1] : chat.users[0];
                        Messenger.socket.emit('INIT_CHAT', {chat: chat, to: toUser});
                    }, 1000);
                }
            });
        }
        $rootScope.chatCount = newChats.length;
    });

    // Socket event receivers

    Messenger.socket.on('NEW_CHAT', function (data) {
        console.log('new chat added: ' + data);
        if(!findInCurrentChats(data._id)){
            $rootScope.currentChats.push(data);
            $rootScope.$apply();
        }
    });
}]);
