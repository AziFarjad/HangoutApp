'use strict';

var recollApp = angular.module('recollApp', []);

recollApp.config(function($logProvider) {
    $logProvider.debugEnabled(true);
});

var isChrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
if (isChrome != true) {
  alert("Please use Google Chrome");
}
