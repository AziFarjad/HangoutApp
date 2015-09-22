/**
* Retrieves ICE servers and returns it via the given Deferred object
* @param {$.Deferred} dfd
*/
function getICEServers(dfd) {
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
      dfd.resolve(data.d);
    }
  );
};
