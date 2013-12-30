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