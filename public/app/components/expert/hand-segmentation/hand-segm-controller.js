'use strict';

recollApp.controller('handSegmController', ['$scope', 'trackingjsHandSegmService', 'leapMotionHandSegmService',
  function($scope, trackingjsHandSegmService, leapMotionHandSegmService) {
    $scope.data = {
        types: [{ id: 'tracking.js', name: 'Colour (Blue)' },
            { id: 'leapmotion', name: 'Leap Motion' }],
        selectedType: null,
        currentService: null
    };
    $scope.captureHands = function(videoSourceSelector) {
      if ($scope.data.currentService) {
        $scope.data.currentService.stopCapturing();
      }
      if ($scope.data.selectedType) {
        if ($scope.data.selectedType.id === 'tracking.js') {
          $scope.data.currentService = trackingjsHandSegmService;
          trackingjsHandSegmService.captureHands(videoSourceSelector);
        } else {
          $scope.data.currentService = leapMotionHandSegmService;
          leapMotionHandSegmService.captureHands(videoSourceSelector);
        }
      }
    };
  }
]);
