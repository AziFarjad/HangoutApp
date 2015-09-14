
var recoll = (function($) {
  var initUI;

  var width = 300;
  var height = 210;
  var connToFieldWorker;
  var snapshotImage = new Image();

  var log = function(message) {
    $('#log').append(message + '\n');
  };

  console.log('foo bar!');
  log('initialised.');

  $('#video').on('canplay', function(event) {
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

  $('#video').on('play', function() {
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
    var peer = new Peer('remote-export-expert', { key: 'vwxqr8i0iwrn3ik9' });

    peer.on('error', function(error) { log("eeek! " + error); });

    peer.on('open', function(id) {
      log('expert is ready to call the field worker, prompting for permission to user video / audio.');

      navigator.getUserMedia({video: true, audio: true}, function(stream) {
        log('expert is calling the fieldworker.');
        var call = peer.call('remote-export-field-worker', stream);

        call.on('stream', function(stream) {
          log('call started, sending and receiving video stream.');

          var url = window.URL || window.webkitURL;
          $('#video').attr('src', url ? url.createObjectURL(stream) : stream);
          $('#video')[0].play();
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
    tracking.ColorTracker.registerColor('pink', function(r, g, b) {
      if (r >= 100 && r <= 170 &&
          g >= 20 && g <= 80 &&
          b >= 60 && b <= 110) {
            return true;
        }
        return false;
    });

    tracking.ColorTracker.registerColor('skin', function(r, g, b) {
      if (r >= 130 && r <= 200 &&
          g >= 110 && g <= 160 &&
          b >= 90 && b <= 120) {
            return true;
        }
        return false;
    });
    var colors = new tracking.ColorTracker(['skin']);
    //var colors = new tracking.ColorTracker(['magenta', 'yellow']);

    var colorRects = [];
    colors.on('track', function(event) {
      colorRects = event.data;
    });

    tracking.track('#video', colors, { camera: false });

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
        if (checkWithinArea(corners[i], corners[i + 1], colorRects)) {
          filteredCorners.push(corners[i]);
          filteredCorners.push(corners[i + 1]);
        }
      }
      connToFieldWorker.send(filteredCorners);
    });
    tracking.track('#video', tracker, { camera: false });
  };

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
