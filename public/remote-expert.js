
var recoll = (function($) {
  var initUI;

  var width = 300;
  var height = 210;
  var connToFieldWorker;
  var snapshotImage = new Image();
  var url = window.URL || window.webkitURL;

  var log = function(message) {
    $('#log').append(message + '\n');
  };

  log('initialised.');

  $('#video_remote').on('canplay', function(event) {
    log('starting video.');
    var video = this;

    if (video.videoWidth > 0) {
      height = video.videoHeight / (video.videoWidth / width);
    }

    $('canvas').attr('height', height);
    $('canvas').attr('width', width);

    $('canvas.reversed').each(function(i, elm) {
      var context = $(elm)[0].getContext('2d');
      context.translate(width, 0);
      context.scale(-1, 1);
    });
  });

  $('#video_remote').on('play', function() {
    var video = this;

    setInterval(function() {
       if (video.paused || video.ended) {
         return;
       }

       var context = $('#canvas')[0].getContext('2d');
       context.fillRect(0, 0, width, height);
       context.drawImage(video, 0, 0, width, height);
    }, 33);
  });

  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

  function iAmTheExpert() {
    // stand-alone peer server recoll-peer-server.herokuapp.com was set up to allow secure connection
    var peer = new Peer('remote-export-expert', { host: 'recoll-peer-server.herokuapp.com', secure: true, port: 443, debug: 3 });

    peer.on('error', function(error) { log("eeek! " + error); });

    peer.on('open', function(id) {
      log('expert is ready to call the field worker, prompting for permission to user video / audio.');

      navigator.getUserMedia({ video: true, audio: true }, function(stream) {
        // display local video
        $('#video_local').attr('src', url ? url.createObjectURL(stream) : stream);
        $('#video_local')[0].play();

        log('expert is calling the fieldworker.');
        var call = peer.call('remote-export-field-worker', stream);

        call.on('stream', function(stream) {
          log('call started, sending and receiving video stream.');

          $('#video_remote').attr('src', url ? url.createObjectURL(stream) : stream);
          $('#video_remote')[0].play();
        });

        log('expert is connecting to fieldworker.');
        connToFieldWorker = peer.connect('remote-export-field-worker');
        connToFieldWorker.on('error', function(err) { log(err); });
        connToFieldWorker.on('open', function() { log('connection opened.'); });
      }, function(err) {
        log('Failed to get local stream' + err);
      });
    });
  };

  function sendSnapshot() {
    var ctx = $('#temp')[0].getContext('2d');
    ctx.drawImage(snapshotImage, 0, 0);
    ctx.drawImage($('#snapshot')[0], 0, 0);

    log('sending snapshot.');
    connToFieldWorker.send($('#temp')[0].toDataURL());
  };

  function takeSnapshot() {
    var snapshot = $('#snapshot');
    var snapshotDataUrl = $('#canvas')[0].toDataURL();
    snapshot
      .css('background', 'url(' + snapshotDataUrl + ') no-repeat center center')
      .sketch()
    snapshot.sketch('actions', []);
    snapshot[0].getContext('2d').clearRect(0, 0, width, height);
    snapshotImage.src = snapshotDataUrl;
  };

  function captureHands() {
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
    //var colors = new tracking.ColorTracker(['magenta', 'yellow']);

    // Detect rectangular areas in video which have objects with the defined colour in them (i.e. hands)
    var colorRects = [];
    colors.on('track', function(event) {
      colorRects = event.data;
    });

    tracking.track('#video_local', colors, { camera: false });

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
        if (checkWithinArea(corners[i], corners[i + 1], colorRects)) {
          filteredCorners.push(corners[i]);
          filteredCorners.push(corners[i + 1]);
        }
      }
      // Send the array of edge dots to field worker as data
      connToFieldWorker.send(filteredCorners);
      showCapturedHands(filteredCorners);
    });
    tracking.track('#video_local', tracker, { camera: false });
  };

  // Checks if the dot is within any of the given rectangulars
  function checkWithinArea(x, y, rects) {
    var within = false;
    rects.forEach(function(rect) {
      if (x >= rect.x && x <= rect.x + rect.width &&
          y >= rect.y && y <= rect.y + rect.height) {
            within = true;
          }
    });
    return within;
  };

  function showCapturedHands(data) {
    var context = $('#canvas_top')[0].getContext('2d');
    context.clearRect(0, 0, width, height);
    for (var i = 0; i < data.length; i += 2) {
      context.fillStyle = '#f00';
      context.fillRect(data[i], data[i + 1], 2, 2);
    }
  };

  initUI = function(
    $expertButton,
    $captureHandsButton,
    $takeSnapshotButton,
    $sendSnapshotButton) {
    $expertButton.click(iAmTheExpert);
    $captureHandsButton.click(captureHands);
    $takeSnapshotButton.click(takeSnapshot);
    $sendSnapshotButton.click(sendSnapshot);
  };

  return {
    initUI : initUI
  };
})( jQuery );
