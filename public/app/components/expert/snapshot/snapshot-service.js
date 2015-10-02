'use strict';

recollApp.service("snapshotService", function() {
  var listeners = [];
  return {
    subscribe: function(callback) {
      listeners.push(callback);
    },
    publish: function(msg) {
      angular.forEach(listeners, function(callback) {
        callback(msg);
      });
    }
  };
});
