'use strict';

/** TODO: Charlie */

recollApp.factory('leapMotionHandSegmService', ['$rootScope', function ($rootScope) {

  var service = {};

  /**
   @param videoSourceSelector - DOM ID of source video
   */
  service.captureHands = function(videoSourceSelector) {
    // sending as an array (or object is also OK) because String data is recognised as a screenshot
    // the event is supposed to be triggered every time the picture needs to be re-drawn
    $rootScope.$emit('hands-data', { type: 'leapMotion', text: 'HANDS' });
  };

  service.stopCapturing = function() {
    // Send something so make leapMotionHandsLayer clean the canvas
    $rootScope.$emit('hands-data', { type: 'leapMotion', text: '' });
  };

  return {
    captureHands: service.captureHands,
    stopCapturing: service.stopCapturing
  };

}]);
