var myApp = angular.module('myApp');

myApp.controller('MenuCtrl', function ($scope, $location) {
  $scope.go = function (target) {
    $location.path(target);
  };
});

myApp.controller('LoginCtrl', function ($scope, $rootScope) {
  var oldWidget = document.querySelector('#a0-widget')
  if (oldWidget) {
    oldWidget.remove();
  }
  $rootScope.Auth0Widget.signin();
});

myApp.controller('LogoutCtrl', function ($scope, $cookies, $location) {
  $cookies.profile = undefined;
  $location.path('/login');
});

myApp.controller('MainCtrl', function ($scope, $cookies, $location) {
  if ($cookies.profile) {
    $scope.message = "Welcome " + JSON.parse($cookies.profile).name;
  } else {
    $location.path('/login');
  }
})
