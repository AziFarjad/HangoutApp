'use strict';

/**
Reversing video on the canvas horizontally (video provided by the camera is reflected)
*/
recollApp.directive('reverseVideo', function() {
  return {
    restrict: 'A',
    link: function(scope, elem, attrs) {
      var context = elem[0].getContext('2d');
      context.translate(attrs.width, 0);
      context.scale(-1, 1);
    }
  };
});
