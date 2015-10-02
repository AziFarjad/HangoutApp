'use strict';

recollApp.controller('snapshotController', ['$scope', 'snapshotService',
  function($scope, snapshotService) {
    $scope.takeSnapshot = function() {
      snapshotService.publish('take');
    };
    $scope.sendSnapshot = function() {
      snapshotService.publish('send');
    };
  }
]);
