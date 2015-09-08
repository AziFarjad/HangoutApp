
var recoll = (function($) {
  var initUI;

  var width = 300;
  var height = 210;
  var peerExpert;
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
        log("fieldworker has recieved a call, prompting for permission to use video / audio.");

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
          log('received snapshot.');
          if (typeof(data) === 'string') {
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

      }, function(err) {
        log('Failed to get local stream' + err);
      });

    });

    peerExpert = peer;
  };

  function sendSnapshot() {
    if (!connToFieldWorker) {
      log('expert is connecting to fieldworker.');
      connToFieldWorker = peerExpert.connect('remote-export-field-worker');

      connToFieldWorker.on('error', function(err) {
        log(err);
      });

      connToFieldWorker.on('open', function() {
        log('connection opened.');

        createAndSendSnapshot();
      });
    } else {
      createAndSendSnapshot();
    }
  };

  function createAndSendSnapshot() {
    var ctx = $('#temp')[0].getContext('2d');
    ctx.drawImage(snapshotImage, 0, 0);
    ctx.drawImage($('#snapshot')[0], 0, 0);

    log('sending snapshot.');
    connToFieldWorker.send($('#temp')[0].toDataURL());
  }

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
    var colors = new tracking.ColorTracker(['magenta', 'cyan', 'yellow']);

    colors.on('track', function(event) {
      if (event.data.length === 0) {
        // No colors were detected in this frame.
      } else {
        event.data.forEach(function(rect) {
          //console.log(rect.x, rect.y, rect.height, rect.width, rect.color);
          connToFieldWorker.send(rect);
        });
      }
    });

    tracking.track('#video', colors, { camera: false });
  }

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
