'use strict';

/**
Subscribes to snapshot-data event and displays it as a background
*/
recollApp.directive('snapshot', ['$rootScope', function ($rootScope) {
  return {
    restrict: 'A',
    link: function(scope, elem, attrs) {
      $rootScope.$on('snapshot-data', function(e, data) {
        elem.css('background', 'url(' + data + ') no-repeat center center');
      });
    }
  };
}]);
