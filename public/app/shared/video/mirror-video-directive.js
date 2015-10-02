'use strict';

/**
 replicating the video on the canvas to get it reversed
 */
recollApp.directive('mirrorVideo', function() {
  return {
    restrict: 'A',
    link: function(scope, elem, attrs) {
      $('#' + attrs.mirrorVideo).on('play', function() {
        var video = this;

        setInterval(function() {
           if (video.paused || video.ended) {
             return;
           }

           var context = elem[0].getContext('2d');
           context.fillRect(0, 0, attrs.width, attrs.height);
           context.drawImage(video, 0, 0, attrs.width, attrs.height);
        }, 33);
      });
    }
  };
});
