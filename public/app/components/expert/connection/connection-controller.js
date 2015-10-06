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
      Leap.loop({
        hand: function(hand){}
      })
      .use('riggedHand')
      // .use('handEntry')
      riggedHandPlugin = Leap.loopController.plugins.riggedHand;

        var context = $('#canvas_top')[0].getContext('2d');
        context.clearRect(0, 0, width, height);

        var canvases = document.getElementsByTagName('canvas')

        canvases[4].className = "leap-canvas"
        console.log('HERE', riggedHandPlugin)

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
