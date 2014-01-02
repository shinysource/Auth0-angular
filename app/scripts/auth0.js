(function () {

  var auth0Widget = new Auth0Widget({
    domain: 'your.domain.com',
    clientID: 'YOUR_CLIENT_ID',
    callbackURL: 'YOUR_CALLBACK_URL',
    callbackOnLocationHash: true
  });

  var auth0 = angular.module('auth0', ['ngCookies', 'ngRoute']);

  auth0.factory('auth0', function ($cookies, $location) {

    function Auth0() { }

    Auth0.prototype = {};

    Auth0.prototype.login = function (pathToRedirect) {
      $cookies.loginRedirectTo = pathToRedirect || '/main';
      auth0Widget.signin();
    };

    Auth0.prototype.logout = function (pathToRedirect) {
      $cookies.profile = undefined;
      $cookies.idToken = undefined;
      $location.path(pathToRedirect || '/login');
    };

    Auth0.prototype.isAuthenticated = function () {
      return !!$cookies.profile;
    };

    Auth0.prototype.currentUser = function () {
      return JSON.parse($cookies.profile);
    };

    Auth0.prototype.token = function () {
      return $cookies.idToken;
    };

    return new Auth0();
  });

  // Auth0 Request Interceptor
  auth0.factory('auth0RequestInterceptor', function ($cookies) {
    return {
      request: function (config) {
        config.headers = config.headers = {};
        if ($cookies.idToken) {
          config.headers['Authorization'] = 'Bearer '+ $cookies.idToken;
        }
        return config;
      }
    };
  });

  auth0.config(function ($httpProvider) {
    $httpProvider.interceptors.push('auth0RequestInterceptor');
  });

  // Auth0 Widget init
  auth0.run(function ($rootScope, $cookies, $location) {
      auth0Widget.parseHash(window.location.hash, function (profile, id_token, access_token, state) {
      $cookies.profile = JSON.stringify(profile);
      $cookies.idToken = id_token;
      $location.path($cookies.loginRedirectTo);
    });

  });

}());
