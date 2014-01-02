var myApp = angular.module('myApp', [
  'ngCookies', 'ngRoute', 'auth0'
]);

myApp.config(function ($routeProvider) {
  $routeProvider
  .when('/main',    { templateUrl: 'views/main.html',     controller: 'MainCtrl'    })
  .when('/logout',  { templateUrl: 'views/logout.html',   controller: 'LogoutCtrl'  })
  .when('/login',   { templateUrl: 'views/login.html',    controller: 'LoginCtrl'   })

  .otherwise({ redirectTo: '/login' });
});
