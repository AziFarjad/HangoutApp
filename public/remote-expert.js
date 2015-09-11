
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

  function iAmTheFieldWorker() {
    var peer = new Peer('remote-export-field-worker', { key: 'vwxqr8i0iwrn3ik9' });

    peer.on('error', function(error) { log("eek! " + error); });

    peer.on('open', function(id) {
      log("field worker is listening for the expert's video call, caller id is '" + id + "'.");

      peer.on('call', function(call) {
        log("fieldworker has received a call, prompting for permission to use video / audio.");

        navigator.getUserMedia({video: true, audio: true}, function(stream) {
          log("fieldworker answered call, sending video stream.");
          call.answer(stream);
        }, function(err) {
          log('Failed to get local stream: ' + err);
        });

        call.on('stream', function(stream) {
          var url = window.URL || window.webkitURL;
          $('#video').attr('src', url ? url.createObjectURL(stream) : stream);
          $('#video')[0].play();
        });
      });

      peer.on('connection', function(conn) {
        conn.on('data', function(data) {
          if (typeof(data) === 'string') {
            log('received snapshot.');
            $('#annotated').css('background', 'url(' + data + ') no-repeat center center')
          } else {
            var context = $('#canvas')[0].getContext('2d');
            context.strokeStyle = data.color;
            context.strokeRect(data.x, data.y, data.width, data.height);
          }
        })
      });
    });
  };

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
    var colors = new tracking.ColorTracker(['pink']);
    //var colors = new tracking.ColorTracker(['yellow']);

    var colorRects = [];
    colors.on('track', function(event) {
      colorRects = event.data;
      /*if (event.data.length === 0) {
        // No colors were detected in this frame.
      } else {
        event.data.forEach(function(rect) {
          //console.log(rect.x, rect.y, rect.height, rect.width, rect.color);
          //connToFieldWorker.send(rect);
        });
      }*/
    });

    tracking.track('#video', colors, { camera: false });

    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');

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
      context.clearRect(0, 0, canvas.width, canvas.height);
      var corners = event.data;
      for (var i = 0; i < corners.length; i += 2) {
        context.fillStyle = '#f00';
        if (checkWithinArea(corners[i], corners[i + 1], colorRects)) {
          context.fillRect(corners[i], corners[i + 1], 2, 2);
        }
      }
    });
    tracking.track('#video', tracker, { camera: false });
  };

  function checkWithinArea(x, y, rects) {
    var within = false;
    //console.log(rects[0] ? (rects[0].x + ' ' + rects[0].y + ' ' + rects[0].width + ' ' + rects[0].height) : '', rects.length);
    rects.forEach(function(rect) {
      if (x >= rect.x && x <= rect.x + rect.width &&
          y >= rect.y && y <= rect.y + rect.height) {
            within = true;
          }
    });
    return within;
  };

  initUI = function(
    $fieldWorkerButton,
    $expertButton,
    $captureHandsButton,
    $takeSnapshotButton,
    $sendSnapshotButton) {
    $fieldWorkerButton.click(iAmTheFieldWorker);
    $expertButton.click(iAmTheExpert);
    $captureHandsButton.click(captureHands);
    $takeSnapshotButton.click(takeSnapshot);
    $sendSnapshotButton.click(sendSnapshot);
  };

  return {
    initUI : initUI
  };
})( jQuery );
