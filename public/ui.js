
$(function() {
  $('[data-autodisable]').click(function() {
    $(this).attr("disabled", true);
  })
})

var isChrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
if (isChrome != true) {
  alert("Please use Google Chrome");
}
