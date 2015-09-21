
var recoll = (function($) {
  var initUI;

  var width = 300;
  var height = 210;
  var url = window.URL || window.webkitURL;

  var log = function(message) {
    $('#log').append(message + '\n');
  };

  log('initialised.');

  $('#video_local').on('canplay', function(event) {
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

  $('#video_local').on('play', function() {
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
    var peer = new Peer('remote-export-field-worker', { host: 'recoll-peer-server.herokuapp.com', secure: true, port: 443, debug: 3 });

    peer.on('error', function(error) { log("eek! " + error); });

    peer.on('open', function(id) {
      log("field worker is listening for the expert's video call, caller id is '" + id + "'.");

      peer.on('call', function(call) {
        log("fieldworker has received a call, prompting for permission to use video / audio.");
        navigator.getUserMedia({ video: true, audio: true }, function(stream) {
          // display local video
          $('#video_local').attr('src', url ? url.createObjectURL(stream) : stream);
          $('#video_local')[0].play();

          log("fieldworker answered call, sending video stream.");
          call.answer(stream);
        }, function(err) {
          log('Failed to get local stream: ' + err);
        });

        call.on('stream', function(stream) {
          $('#video_remote').attr('src', url ? url.createObjectURL(stream) : stream);
          $('#video_remote')[0].play();
        });
      });

      peer.on('connection', function(conn) {
        conn.on('data', function(data) {
          if (typeof(data) === 'string') {
            log('received snapshot.');
            $('#annotated').css('background', 'url(' + data + ') no-repeat center center')
          } else {
            var context = $('#canvas_top')[0].getContext('2d');
            context.clearRect(0, 0, width, height);
            for (var i = 0; i < data.length; i += 2) {
              context.fillStyle = '#f00';
              context.fillRect(data[i], data[i + 1], 2, 2);
            }
          }
        })
      });
    });
  };

  initUI = function(
    $fieldWorkerButton) {
    $fieldWorkerButton.click(iAmTheFieldWorker);
  };

  return {
    initUI : initUI
  };
})( jQuery );
