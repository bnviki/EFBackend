/**
 * Created with JetBrains WebStorm.
 * User: vikram
 * Date: 12/11/13
 * Time: 10:45 AM
 * To change this template use File | Settings | File Templates.
 */
function ChatWindowCtrl($scope, $http, $rootScope, UserManager, $routeParams){
    var conn = null;
    console.log("routeparams: " + $routeParams.username);
    $scope.chatUser = {};
    $scope.chatUserStatus = 'unavailable';

    $http.get('/users', {params:{username:$routeParams.username}}).success(function(data){
        if(data.length > 0){
            $scope.chatUser = data[0];
            $http.get('/plugins/presence/status', {params:{jid:$scope.chatUser.username + '@vikram', type:'xml'}}).success(function(data){
                console.log('presence: '+data);
                if(data.search('unavailable') == -1){
                    $scope.chatUserStatus = 'online';
                }
                else
                    $scope.chatUserStatus = 'unavailable';
            });
        }
    });


    $scope.msgs = [{from:'chat_style_me', message:'hi'},
        {from:'chat_style_other', message:'how are you'}];

    function connectToServer(){
        conn = new Strophe.Connection('http-bind/');
        conn.connect("vikram", "", function (status) {
            if (status === Strophe.Status.CONNECTED) {
                console.log("strophe connected");

                conn.xmlInput = function (xml) {
                    console.log('Incoming:');
                    console.log(xml);
                };
                conn.xmlOutput = function (xml) {
                    console.log('Outgoing:');
                    console.log(xml);
                };

                conn.addHandler(onMsg, null, 'message', 'chat');

            } else if (status === Strophe.Status.DISCONNECTED) {
                console.log('disconnected');
            }
        });
    }

    var onMsg = function(message){
        console.log("msg recieved: " + message);
        var body = $(message).find("html > body");
        if (body.length === 0) {
            body = $(message).find('body');
            if (body.length > 0) {
                body = body.text()
            } else {
                body = null;
            }
        } else {
            body = body.contents();
        }
        if (body) {
            var newmsg = {from: 'chat_style_other', message: body};
            $scope.msgs.push(newmsg);
            $scope.$apply();
        }
        return true;
    };

    connectToServer();

    $scope.sendMsg = function(msg){
        conn.send($pres({
            to: $scope.chatUser.username + '@vikram'
        }));
        conn.send($msg({
            to: $scope.chatUser.username + '@vikram',
            "type": "chat"
        }).c('body').t(msg));
        var newmsg = {from: 'chat_style_me', message: msg};
        $scope.msgs.push(newmsg);
    }
}