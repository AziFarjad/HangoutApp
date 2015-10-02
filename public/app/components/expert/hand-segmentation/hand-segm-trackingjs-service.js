'use strict';

recollApp.factory('trackingjsHandSegmService', ['$rootScope', function ($rootScope) {

  var service = {};

  /** Checks if the dot is within any of the given rectangulars
  @param {Number} x
  @param {Number} y
  @param {Array} rects - array of rectuangulars, each element has properties: x, y, width, height
  */
  service.checkWithinArea = function(x, y, rects) {
    var within = false;
    rects.forEach(function(rect) {
      if (x >= rect.x && x <= rect.x + rect.width &&
          y >= rect.y && y <= rect.y + rect.height) {
            within = true;
          }
    });
    return within;
  };

  /**
   @param videoSourceSelector - DOM ID of source video
   */
  service.captureHands = function(videoSourceSelector) {
  // Define a custom colour in Tracking utility
  // Use Digital Color Meter tool to calibrate the new colour

    // use for poor light
    tracking.ColorTracker.registerColor('blue', function(r, g, b) {
      if (r >= 10 && r <= 50 &&
          g >= 20 && g <= 90 &&
          b >= 80 && b <= 150) {
            return true;
        }
        return false;
    });
    /* Use for good light
    tracking.ColorTracker.registerColor('blue', function(r, g, b) {
      if (r >= 10 && r <= 70 &&
          g >= 60 && g <= 120 &&
          b >= 160 && b <= 215) {
            return true;
        }
        return false;
    });*/
    var colors = new tracking.ColorTracker(['blue']);
    //var colors = new tracking.ColorTracker(['magenta', 'yellow']); // magenta and yellow are predefined colours

    // Detect rectangular areas in video which have objects with the defined colour in them (i.e. hands)
    var colorRects = [];
    colors.on('track', function(event) {
      colorRects = event.data;
    });

    tracking.track(videoSourceSelector, colors, { camera: false });

    // Apply Fast Tracking to video it order to define object edges
    // http://trackingjs.com/examples/fast_camera.html
    var FastTracker = function() {
      FastTracker.base(this, 'constructor');
    };
    tracking.inherits(FastTracker, tracking.Tracker);
    tracking.Fast.THRESHOLD = 2;
    FastTracker.prototype.threshold = tracking.Fast.THRESHOLD;
    FastTracker.prototype.track = function(pixels, width, height) {
      var gray = tracking.Image.grayscale(pixels, width, height);
      var corners = tracking.Fast.findCorners(gray, width, height);
      this.emit('track', {
        data: corners
      });
    };
    var tracker = new FastTracker();
    tracker.on('track', function(event) {
      var corners = event.data;
      var filteredCorners = [];
      for (var i = 0; i < corners.length; i += 2) {
        // Only record a dot if it's within the areas defined by colour tracking
        if (service.checkWithinArea(corners[i], corners[i + 1], colorRects)) {
          filteredCorners.push(corners[i]);
          filteredCorners.push(corners[i + 1]);
        }
      }
      // Send the array of edge dots to field worker as data
      $rootScope.$emit('hands-data', { type: 'trackingjs', dots: filteredCorners });
    });
    tracking.track(videoSourceSelector, tracker, { camera: false });
  };

  service.stopCapturing = function() {
    // TODO: stop tracking
    alert('Sorry, reload the page now - Colour tracking can\'t be stoped at the moment');
  };

  return {
    captureHands: service.captureHands,
    stopCapturing: service.stopCapturing
  };

}]);
