'use strict';

angular.module('OCServices', ['ngResource'])
    .factory('UserManager', ['$http', '$q', '$rootScope', 'ChatClient', function($http, $q, $rootScope, ChatClient){

        var userManager = {};

        userManager.currentUser = null;

        userManager.setCurrentUser = function(user){
            userManager.currentUser = user;
            if(user == null){
                $rootScope.$broadcast('event:loggedOut', userManager.currentUser);
            } else {
                $rootScope.$broadcast('event:loginConfirmed', userManager.currentUser);
                ChatClient.connect(user.username + '@' + ChatClient.host, user.username);
            }

        }

        userManager.login = function(uname, pword){
            var deffered = $q.defer();
            $http.post('/login', {username: uname, password: pword}).success(function(data){
                userManager.setCurrentUser(data);
                deffered.resolve(userManager.currentUser);
            }).error(function(){
                    deffered.reject('login failed');
                });
            return deffered.promise;
        };

        userManager.logout = function(){
            var deffered = $q.defer();
            $http.get('/logout').success(function(data){
                userManager.setCurrentUser(null);
                ChatClient.disconnect();
                deffered.resolve();
            }).error(function(){
                    deffered.reject('logout failed');
                });
            return deffered.promise;
        };

        userManager.checkUser = function(){
            var deffered = $q.defer();
            $http.get('/ping').success(function(data, status){
                if(status == 200){
                    userManager.setCurrentUser(data);
                    deffered.resolve(userManager.currentUser);
                    return;
                }
                userManager.currentUser = null;
                deffered.reject('session expired');
            });
        };

        userManager.logUserIn = function(user){
            if(userManager.currentUser != null)
                logout();
            userManager.currentUser = user
        };

        userManager.isLoggedIn = function(){
            if(userManager.currentUser != null)
                return true;
            return false;
        };

        userManager.getCurrentUser = function(){
            return userManager.currentUser;
        };

        return userManager;
    }])
    .factory('User', ['$resource', function($resource) {
        return $resource('/users/:id',
            {id: '@_id'});
    }]).factory('Discussion', ['$resource', function($resource) {
        return $resource('/discussion/:discid',
            {discid: '@_id'}, {interested: {method: 'POST', url: '/interested'}});
    }]).factory('Messenger', ['$resource', function($resource) {
        var msgr = {};
        msgr.socket = io.connect();
        msgr.send = function(eventName, data){
            this.socket.emit(eventName, data);
        }
        return msgr;
    }]);

