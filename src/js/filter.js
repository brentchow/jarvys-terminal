/*
 *		TERMINAL SIM - filter.js
 *		Created by @helloBrent
 *		A JARVYS.io Project
 */

jarvys.filter('nl2br', ['$sce', function ($sce) {
  return function (text) {
    return text ? $sce.trustAsHtml(text.replace(/\n/g, '<br/>')) : '';
  };
}]);