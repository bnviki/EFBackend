'use strict';

angular.module('OCServices', ['ngResource'])
    .factory('UserManager', ['$http', '$q', '$rootScope', 'ChatClient', function($http, $q, $rootScope, ChatClient){

        var userManager = {};

        userManager.currentUser = null;

        userManager.setCurrentUser = function(user){
            var deffered = $q.defer();
            userManager.currentUser = user;
            if(user == null){
                $rootScope.$broadcast('event:loggedOut', userManager.currentUser);
                deffered.resolve();
            } else {
                ChatClient.connect(user.username + '@' + ChatClient.host, user.username).then(function(){
                    $rootScope.$broadcast('event:loginConfirmed', userManager.currentUser);
                    deffered.resolve();
                });
            }
            return deffered.promise;
        }

        userManager.login = function(uname, pword){
            var deffered = $q.defer();
            $http.post('/login', {username: uname, password: pword}).success(function(data){
                userManager.setCurrentUser(data).then(function(){
                    deffered.resolve(userManager.currentUser);
                });
            }).error(function(data){
                    deffered.reject(data.message);
                });
            return deffered.promise;
        };

        userManager.logout = function(){
            var deffered = $q.defer();
            $http.get('/logout').success(function(data){
                userManager.setCurrentUser(null).then(function(){
                    ChatClient.disconnect();
                    deffered.resolve();
                });
            }).error(function(){
                    deffered.reject('logout failed');
                });
            return deffered.promise;
        };

        userManager.checkUser = function(){
            var deffered = $q.defer();
            $http.get('/ping').success(function(data, status){
                if(status == 200){
                    userManager.setCurrentUser(data).then(function(){
                        deffered.resolve(userManager.currentUser);
                    });
                    //deffered.resolve(userManager.currentUser);
                    return;
                }
                userManager.currentUser = null;
                deffered.reject('session expired');
            });
            return deffered.promise;
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

        userManager.removeAccount = function(){
            if(!userManager.currentUser)
                return null;
            var deffered = $q.defer();
            $http.post('/users/' + userManager.currentUser._id + '/remove').success(function(data){
                userManager.setCurrentUser(null).then(function(){
                    ChatClient.disconnect();
                    deffered.resolve();
                });
            }).error(function(data){
                    deffered.reject();
            });
            return deffered.promise;
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

