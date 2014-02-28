/**
 * Created with JetBrains WebStorm.
 * User: vikram
 * Date: 28/12/13
 * Time: 6:44 PM
 * To change this template use File | Settings | File Templates.
 */

var directiveMod = angular.module('OCDirectives', [])
directiveMod.directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.ngEnter);
                });

                event.preventDefault();
            }
        });
    };
});

directiveMod.directive('scrollToBottom', function() {
    return function(scope, element, attrs) {
        if (scope.$last){
            var fromTop = element[0].scrollHeight * scope.noOfScrollMsgs;
            //var fromTop = $(".chat-content").scrollTop();
            //$("#chat-content").slimScroll({ scrollTo: fromTop + 'px' });
        }
    };
});

directiveMod.directive('ngSlimScroll', function() {
    return function(scope, element, attrs) {
        element.slimScroll({height: attrs.slimScrollHeight});
        scope.$watch(function(){
            return element.children().children().size();
        }, function(val){
            var len = element[0].scrollHeight * scope.noOfScrollMsgs;;
            element.slimScroll({scrollTo: len});
        })
    };
});

directiveMod.directive('uniqueUsername', ['$http', function($http) {
    var toId;
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elem, attr, ctrl) {
            //when the scope changes, check the email.
            scope.$watch(attr.ngModel, function(value) {
                // if there was a previous attempt, stop it.
                if(toId) clearTimeout(toId);
                if(!value || value == ''){
                    ctrl.$setValidity('uniqueUsername', true);
                    return;
                }
                // start a new attempt with a delay to keep it from
                // getting too "chatty".
                toId = setTimeout(function(){
                    // call to some API that returns { isValid: true } or { isValid: false }
                    $http.get('/users', {params: {username: value}}).success(function(data) {
                        if(!data || data.length <= 0)
                            ctrl.$setValidity('uniqueUsername', true);
                        else if(data && data.length > 0)
                            ctrl.$setValidity('uniqueUsername', false);
                    });
                }, 200);
            })
        }
    }
}]);

directiveMod.directive('uniqueEmail', ['$http', function($http) {
    var toId;
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elem, attr, ctrl) {
            //when the scope changes, check the email.
            scope.$watch(attr.ngModel, function(value) {
                // if there was a previous attempt, stop it.
                if(toId) clearTimeout(toId);
                if(!value || value == ''){
                    ctrl.$setValidity('uniqueEmail', true);
                    return;
                }
                // start a new attempt with a delay to keep it from
                // getting too "chatty".
                toId = setTimeout(function(){
                    // call to some API that returns { isValid: true } or { isValid: false }
                    $http.get('/users', {params: {email: value}}).success(function(data) {
                        if(!data || data.length <= 0)
                            ctrl.$setValidity('uniqueEmail', true);
                        else if(data && data.length > 0)
                            ctrl.$setValidity('uniqueEmail', false);
                    });
                }, 200);
            })
        }
    }
}]);

directiveMod.directive('confirmPassword', ['$parse', function($parse) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elem, attrs, ctrl) {
            if (!ctrl) return;
            if (!attrs['confirmPassword']) return;

            var firstPassword = $parse(attrs['confirmPassword']);

            var validator = function (value) {
                var temp = firstPassword(scope),
                    v = value === temp;
                ctrl.$setValidity('confirmPassword', v);
                return value;
            }

            ctrl.$parsers.unshift(validator);
            ctrl.$formatters.push(validator);
            attrs.$observe('confirmPassword', function () {
                validator(ctrl.$viewValue);
            });
        }
    }
}]);