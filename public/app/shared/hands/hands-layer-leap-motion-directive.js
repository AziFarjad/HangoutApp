'use strict';

/**
Displaying Leap Motion data on the canvas
TODO: Charlie
*/
recollApp.directive('leapMotionHandsLayer', ['$rootScope', function ($rootScope) {
  return {
    restrict: 'A',
    link: function(scope, elem, attrs) {
      $rootScope.$on('hands-data', function(e, data) {
        if (data.type && data.type === 'leapMotion') {
            var riggedHandPlugin;

            Leap.loop({
              hand: function(hand){}
            })
            .use('riggedHand')
            riggedHandPlugin = Leap.loopController.plugins.riggedHand;

            // var canvases = document.getElementsByTagName('canvas')
            // canvases[4].className = "leap-canvas"

          var context = elem[0].getContext('2d');
          context.clearRect(0, 0, elem[0].width, elem[0].height);
          context.font="20px Georgia";
          context.fillText(data.text, 10, 50);
        }
      });
    }
  };
}]);
