'use strict';

recollApp.controller('connectionController', ['$scope', '$rootScope', '$q', '$window',
      '$sce', 'connectionService',
  function($scope, $rootScope, $q, $window, $sce, connectionService) {
    $scope.streams = {}; // local and remote video streams URLs

    var localVideoDeferred = $q.defer();
    var remoteVideoDeferred = $q.defer();

    var url = $window.URL || $window.webkitURL;

    $scope.connect = function() {
      navigator.getUserMedia = $window.navigator.getUserMedia || $window.navigator.webkitGetUserMedia || $window.navigator.mozGetUserMedia;
      connectionService.connect(localVideoDeferred, remoteVideoDeferred);

      $rootScope.$on('hands-data', function(e, data) {
        connectionService.sendData(data);
      });
    };

    $scope.activateLeapMotion = function() {
      Leap.Controller().use('riggedHand').connect()
    };

    localVideoDeferred.promise.then(function(stream) {
      $scope.streams.local = $sce.trustAsResourceUrl(url.createObjectURL(stream));
    }, function(err) {
      console.log(err);
    });

    remoteVideoDeferred.promise.then(function(stream) {
      $scope.streams.remote = $sce.trustAsResourceUrl(url.createObjectURL(stream));
    }, function(err) {
      console.log(err);
    });
  }
]);
