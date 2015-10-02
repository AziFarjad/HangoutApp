'use strict';

recollApp.factory('connectionService', ['$rootScope', 'iceServersService', function ($rootScope, iceServersService) {

  var service = {};

  var url = window.URL || window.webkitURL;

  service.connect = function(localVideoDeferred, remoteVideoDeferred) {
    service.localVideoDeferred = localVideoDeferred;
    service.remoteVideoDeferred = remoteVideoDeferred;

    var promise = iceServersService.getICEServers();
    promise.then(service.initPeer);
  };

  /**
  * Initialise peer.js connection
  @param {Object} config - contains the ICE servers array
  */
  service.initPeer = function(config) {
    // stand-alone peer server recoll-peer-server.herokuapp.com was set up to allow HTTPS
    service.peer = new Peer('remote-export-field-worker',
      { host: 'recoll-peer-server.herokuapp.com',
        secure: true,
        port: 443,
        debug: 0,
        config: config
    });

    service.peer.on('error', function(error) { service.remoteVideoDeferred.reject(error); });

    service.peer.on('open', service.onPeerOpen);
  };

  service.onPeerOpen = function(id) {
    console.log("field worker is listening for the expert's video call, caller id is '" + id + "'.");

    service.peer.on('call', function(call) {
      console.log("fieldworker has received a call, prompting for permission to use video / audio.");
      navigator.getUserMedia({ video: true, audio: true },
        angular.bind(service, service.onGotUserMedia, call),
        function(err) {
          service.localVideoDeferred.reject(stream);
        });

      call.on('stream', function(stream) {
        service.remoteVideoDeferred.resolve(stream);
      });
    });

    service.peer.on('connection', function(conn) {
      conn.on('data', function(data) {
        if (typeof(data) === 'string') {
          $rootScope.$emit('snapshot-data', data);
        } else {
          $rootScope.$emit('hands-data', data);
        }
      });
    });
  };

  service.onGotUserMedia = function(call, stream) {
    service.localVideoDeferred.resolve(stream);

    console.log("fieldworker answered call, sending video stream.");
    call.answer(stream);
  };

  return {
    connect: service.connect
  };

}]);
