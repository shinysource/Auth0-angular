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

myApp.controller('LoginCtrl', function (auth, $scope, $location, $http) {
  $scope.login =  {user: '', pass: ''};
  $scope.signup = {user: '', pass: '', favColor: 'red'};
  $scope.doLogin = function () {
    auth.signin({
      connection: 'Username-Password-Authentication',
      username:   $scope.user,
      password:   $scope.pass
    });
  };

  $scope.doSignup = function () {
    $http({method: 'POST', url: '/custom-signup',
    data: {
      email:    $scope.signup.user,
      password:     $scope.signup.pass,
      favColor: $scope.signup.favColor
    }})
    .success(function (data, status, headers, config) {
      if (status === 200) {
        auth.signin({
          // Make sure that connection matches your server-side connection id
          connection: 'Username-Password-Authentication',
          username:   $scope.signup.user,
          password:   $scope.signup.pass
        });
      }
    })
    .error(function (data, status, headers, config) {
      window.alert('Error creating account for user ' + $scope.signup.user + ': '  + data);
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
