var myApp = angular.module('myApp', [
  'ngCookies', 'ngRoute', 'auth0'
]);

myApp.config(function ($routeProvider, auth0WidgetProvider) {
  $routeProvider
  .when('/logout',  {
    templateUrl: 'views/logout.html',
    controller: 'LogoutCtrl'
  })
  .when('/login',   {
    templateUrl: 'views/login.html',
    controller: 'LoginCtrl',
  })
  .when('/public', {
    templateUrl: 'views/public.html',
    controller: 'PublicCtrl',
  })
  .when('/', {
    templateUrl: 'views/root.html',
    controller: 'RootCtrl'
  })
  .otherwise({ redirectTo: '/login' });

  auth0WidgetProvider.init({
    domain: 'your.domain.com',
    clientID: 'YOUR_CLIENT_ID',
    callbackURL: 'YOUR_CALLBACK_URL',
    callbackOnLocationHash: true
  });
});
