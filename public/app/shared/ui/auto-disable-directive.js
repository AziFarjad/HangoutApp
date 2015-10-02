'use strict';

recollApp.directive('autoDisable', function() {
  return {
    restrict: 'A',
    link: function(scope, elem, attrs) {
      elem.click(function() {
        $(this).attr("disabled", true);
      });
    }
  };
});
