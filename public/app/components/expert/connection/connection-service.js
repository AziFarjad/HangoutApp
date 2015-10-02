'use strict';

recollApp.factory('connectionService', ['$rootScope', '$q', 'iceServersService', function ($rootScope, $q, iceServersService) {

  var service = {};

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
    service.peer = new Peer('remote-export-expert',
      { host: 'recoll-peer-server.herokuapp.com',
        secure: true,
        port: 443,
        debug: 0,
        config: config
    });

    service.peer.on('error', function(error) { console.log("eeek! " + error); });

    service.peer.on('open', service.onPeerOpen);
  };

  service.onGotUserMedia = function(stream) {
    service.localVideoDeferred.resolve(stream);

    console.log('expert is calling the fieldworker.');
    var call = service.peer.call('remote-export-field-worker', stream);

    call.on('stream', function(stream) {
      console.log('call started, sending and receiving video stream.');

      service.remoteVideoDeferred.resolve(stream);
    });

    console.log('expert is connecting to fieldworker.');
    // TODO: make the ID configurable to allow multiple connections per server
    service.connToFieldWorker = service.peer.connect('remote-export-field-worker');
    // TODO: create log service
    service.connToFieldWorker.on('error', function(err) { service.remoteVideoDeferred.reject(err); });
    service.connToFieldWorker.on('open', function() { console.log('connection opened.'); });
  };

  service.onPeerOpen = function() {
    console.log('expert is ready to call the field worker, prompting for permission to user video / audio.');

    navigator.getUserMedia({ video: true, audio: true },
      service.onGotUserMedia,
      function(err) {
        service.localVideoDeferred.reject(err);
      });
  };

  service.sendData = function(data) {
    if (!service.connToFieldWorker) {
      console.log('sending data before connection is established');
      return;
    }
    service.connToFieldWorker.send(data);
  };

  return {
    connect: service.connect,
    sendData: service.sendData
  };

}]);
