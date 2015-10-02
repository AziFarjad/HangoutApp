'use strict';

recollApp.directive('snapshot', ['snapshotService', 'connectionService', function (snapshotService, connectionService) {
  return {
    restrict: 'A',
    link: function(scope, elem, attrs) {
      var snapshotImage = new Image();

      snapshotService.subscribe(function(msg) {
        var imageSourceSelector = '#canvas';
        var takeSnapshot = function() {
          var snapshotDataUrl = $(imageSourceSelector)[0].toDataURL();
          elem
            .css('background', 'url(' + snapshotDataUrl + ') no-repeat center center')
            .sketch();
          elem.sketch('actions', []);
          elem[0].getContext('2d').clearRect(0, 0, $(imageSourceSelector)[0].width, $(imageSourceSelector)[0].height);
          snapshotImage.src = snapshotDataUrl;
        };
        var sendSnapshot = function() {
          var ctx = $('#temp')[0].getContext('2d');
          ctx.drawImage(snapshotImage, 0, 0);
          ctx.drawImage(elem[0], 0, 0);
          connectionService.sendData($('#temp')[0].toDataURL());
        };

        if (msg === 'take') {
          takeSnapshot();
        } else if (msg === 'send') {
          sendSnapshot();
        }
      });
    }
  };
}]);
