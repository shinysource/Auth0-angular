var myApp = angular.module('myApp', ['auth0']);

myApp.factory('authRequestInterceptor', function (auth) {
  return {
    request: function (config) {
      config.headers = config.headers = {};
      if ($cookies.idToken) {
        config.headers.Authorization = 'Bearer '+ auth.idToken;
      }
      return config;
    }
  };
});

myApp.config(function ($httpProvider) {
  $httpProvider.interceptors.push('authRequestInterceptor');
});

