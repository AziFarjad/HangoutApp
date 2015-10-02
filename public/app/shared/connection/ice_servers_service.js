'use strict';

recollApp.factory('iceServersService', ['$q', function ($q) {

  var service = {};

  /**
  * Retrieves ICE servers and returns it via the given Deferred object
  * @param {$.Deferred} dfd
  */
  service.getICEServers = function() {
    var deferred = $q.defer();
    $.get("https://service.xirsys.com/ice",
      {
        ident: "katiab", /* dummy account, for details contact kbondar@thoughtworks.com */
        secret: "e3583034-60bd-11e5-817c-d5d50119bcf4",
        domain: "remote-expert.herokuapp.com",
        application: "default",
        room: "default",
        secure: 1
      },
      function(data, status) {
        deferred.resolve(data.d);
      });
      return deferred.promise;
  };

  return {
    getICEServers: service.getICEServers
  };

}]);
