var filterMod = angular.module('OCFilters', [])
    filterMod.filter('removeCurrentUser', ['UserManager', function(UserManager){
        var removeMeFilter = function(input){
            var currentUser = UserManager.getCurrentUser();
            var output = [];
            for(var i=0; i < input.length; i++){
                if(input[i]._id && input[i]._id != currentUser._id){
                    output.push(input[i]);
                }
            }
            return output;
        };
        return removeMeFilter;
    }]);

    filterMod.filter('catFilter', function(){
        var catFilter = function(input, cat){
            var output = [];
            for(var i=0; i < input.length; i++){
                if(input[i].category && input[i].category.name == cat){
                    output.push(input[i]);
                }
            }
            return output;
        }
        return catFilter;
    });

    filterMod.filter('orderDiscByDate', function(){
        var orderFilter = function(input){
            var output = [];
            for(var i=0; i < input.length; i++){
                if(input[i].category && input[i].category.name == cat){
                    output.push(input[i]);
                }
            }
            return output;
        }
        return orderFilter;
    });