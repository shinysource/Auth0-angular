var myApp = angular.module('myApp');

myApp.controller('MenuCtrl', function ($scope, $location) {
  $scope.go = function (target) {
    $location.path(target);
  };
});

myApp.controller('RootCtrl', function (auth0Widget, $scope, $location, $http) {
  if (!auth0Widget.isAuthenticated) {
    $location.path('/login');
    return;
  }
  $scope.auth = auth0Widget;

  $scope.sendProtectedMessage = function () {
    $http({method: 'GET', url: '/api/protected'})
      .success(function (data, status, headers, config) {
        $scope.result = 'Protected data was: ' + data;
      });
  };
});

myApp.controller('LoginCtrl', function (auth0Widget, $scope, $location) {
  auth0Widget.signin();
});

myApp.controller('LogoutCtrl', function (auth0Widget, $scope, $location) {
  auth0Widget.signout();
  $location.path('/login');
});
