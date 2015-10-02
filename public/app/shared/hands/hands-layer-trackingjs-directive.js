'use strict';

/**
Diplays captured hands on the layer above field worker's video
@param {Array} data - array like [x1, y1, x2, y2, ...]
*/
recollApp.directive('trackingjsHandsLayer', ['$rootScope', function ($rootScope) {
  return {
    restrict: 'A',
    link: function(scope, elem, attrs) {
      $rootScope.$on('hands-data', function(e, data) {
        if (data.type && data.type === 'trackingjs') {
          var context = elem[0].getContext('2d');
          context.clearRect(0, 0, elem[0].width, elem[0].height);
          for (var i = 0; i < data.dots.length; i += 2) {
            context.fillStyle = '#f00';
            context.fillRect(data.dots[i], data.dots[i + 1], 2, 2);
          }
        }
      });
    }
  };
}]);
