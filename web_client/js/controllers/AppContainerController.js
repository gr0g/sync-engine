'use strict';


var app = angular.module('InboxApp.controllers');


app.controller('AppContainerController', function($scope, $rootScope, wire, growl, IBMessage, protocolhandler) {

    $scope.notificationButtonClick = function() {
        growl.requestPermission(
            function success() {
                console.log("Enabled notifications");
                growl.post("Updates from Disconnect", "MG: Lorem ipsum dolor sit amet, consectetur adipisicing");

            }, function failure() {
                console.log("Failure Enabling notifications");
            }
        );
    };


    protocolhandler.register();


    $rootScope.$on('LocalStorageModule.notification.error', function(e) {
        console.log(e);
    })


    Mousetrap.bind('command+shift+k', function(e) {
        alert('command+shift+k');
        return false;
    });


    $scope.messages = [];
    $scope.activeMessage = undefined;


    $scope.loadMessagesForFolder = function(folder) {

        $scope.statustext = "Loading messages...";
        wire.rpc('messages_for_folder', {
                folder_name: folder
            },
            function(data) {

                $scope.statustext = "";
                var arr_from_json = JSON.parse(data);

                var freshMessages = [];
                angular.forEach(arr_from_json, function(value, key){
                    var newMessage = new IBMessage(value);
                    freshMessages.push(newMessage);
                });
                $scope.messages = freshMessages;
            }
        );
    };


    $scope.sendMessage = function(message_string) {

        wire.rpc('send_mail', {
                message_to_send: {'subject' : 'Hello world',
                                  'body' : message_string,
                                  'to' : 'christine@spang.cc' }
            },
            function(data) {

                alert('Sent mail!');

            }
        );

    }


    $scope.openMessage = function(selectedMessage) {

        $scope.activeMessage = selectedMessage;
        $scope.activeMessage.body_text = 'Loading&hellip;';

        console.log(selectedMessage);

        wire.rpc('data_with_id', {
                data_id: selectedMessage.data_id
            }, function(data) {
                // var data = atob(data)
                $scope.activeMessage.body_text = data;
            }
        );

    }


    wire.on('new_mail_notification', function(data) {
        console.log("new_mail_notificaiton");
        growl.post("New Message!", "Michael: Lorem ipsum dolor sit amet, consectetur adipisicing");
    });


    $scope.doubleClickedMessage = function(clickedMessage) {
        console.log('Double clicked message:');
        console.log(clickedMessage);
    }


    // Loaded. Load the messages.
    // TOFIX we should load these once we know the socket has actually connected
    setTimeout(function() {
        $scope.loadMessagesForFolder('Inbox');
    }, 2000);



});


/* TODO move these declarations so they don't pollute the global namespace
http://stackoverflow.com/questions/14184656/angularjs-different-ways-to-create-controllers-and-services-why?rq=1
*/