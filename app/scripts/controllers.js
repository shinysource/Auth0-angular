var myApp = angular.module('myApp');

myApp.controller('MenuCtrl', function ($scope, $location) {
  $scope.go = function (target) {
    $location.path(target);
  };
});

myApp.controller('LoginCtrl', function ($scope, $rootScope) {
  $rootScope.Auth0Widget.signin();
});

myApp.controller('LogoutCtrl', function ($scope, $cookies, $location) {
  $cookies.profile = undefined;
  $location.path('/login');
});

myApp.controller('MainCtrl', function ($scope, $cookies, $location, $http) {
  if ($cookies.profile) {
    $scope.message = "Welcome " + JSON.parse($cookies.profile).name;
  } else {
    $location.path('/login');
    return;
  }
  $scope.sendProtectedMessage = function () {
    $http({method: 'GET', url: '/api/protected'})
      .success(function (data, status, headers, config) {
        $scope.message = 'Protected data was: ' + data;
      });
  };
});
