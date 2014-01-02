var myApp = angular.module('myApp');

myApp.controller('MenuCtrl', function ($scope, $location) {
  $scope.go = function (target) {
    $location.path(target);
  };
});

myApp.controller('LoginCtrl', function (auth0) {
  auth0.login();
});

myApp.controller('LogoutCtrl', function (auth0) {
  auth0.logout();
});

myApp.controller('MainCtrl', function (auth0, $http, $location, $scope) {
  if (auth0.isAuthenticated()) {
    $scope.message = 'Welcome ' + auth0.currentUser().name;
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
