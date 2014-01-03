var myApp = angular.module('myApp');

myApp.controller('MenuCtrl', function ($scope, $location) {
  $scope.go = function (target) {
    $location.path(target);
  };
});

myApp.controller('RootCtrl', function (auth, $scope, $location, $http) {
  if (!auth.isAuthenticated) {
    $location.path('/login');
    return;
  }
  $scope.auth = auth;

  $scope.sendProtectedMessage = function () {
    $http({method: 'GET', url: '/api/protected'})
      .success(function (data, status, headers, config) {
        $scope.result = 'Protected data was: ' + data;
      });
  };
});

myApp.controller('LoginCtrl', function (auth, $scope, $location) {
  $scope.user = '';
  $scope.pass = '';
  $scope.submit = function () {
    auth.signin({
      connection: 'Username-Password-Authentication',
      username: $scope.user,
      password: $scope.pass
    });
  };

  $scope.$on('auth:login-error', function (event, err) {
    alert(err);
  });

  $scope.doGoogleAuth = function () {
    auth.signin({connection: 'google-oauth2'});
  };
});

myApp.controller('LogoutCtrl', function (auth, $scope, $location) {
  auth.signout();
  $location.path('/login');
});
