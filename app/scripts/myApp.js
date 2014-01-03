var myApp = angular.module('myApp', [
  'ngCookies', 'ngRoute', 'auth0', 'authInterceptor'
]);

myApp.config(function ($routeProvider, authProvider) {
  $routeProvider
  .when('/logout',  {
    templateUrl: 'views/logout.html',
    controller: 'LogoutCtrl'
  })
  .when('/login',   {
    templateUrl: 'views/login.html',
    controller: 'LoginCtrl',
  })
  .when('/', {
    templateUrl: 'views/root.html',
    controller: 'RootCtrl'
  })
  .otherwise({ redirectTo: '/login' });

  authProvider.init({
    domain: 'your.domain.com',
    clientID: 'YOUR_CLIENT_ID',
    callbackURL: 'YOUR_CALLBACK_URL',
    callbackOnLocationHash: true
  });
});
