var myApp = angular.module('myApp', [
  'ngCookies', 'ngRoute'
]);

myApp.config(function ($routeProvider) {
  
  $routeProvider
  .when('/main',    { templateUrl: 'views/main.html',     controller: 'MainCtrl'    })
  .when('/logout',  { templateUrl: 'views/logout.html',   controller: 'LogoutCtrl'  })
  .when('/login',   { templateUrl: 'views/login.html',    controller: 'LoginCtrl'   })

  .otherwise({ redirectTo: '/login' });
  
})
.run(function ($rootScope, $cookies, $location) {
  $rootScope.Auth0Widget = new Auth0Widget({
      domain: 'YOUR_DOMAIN', 
      clientID: 'YOUR_CLIENT_ID', 
      callbackURL: 'YOUR_CALLBACK_URL',
      callbackOnLocationHash: true
  });

    $rootScope.Auth0Widget.parseHash(window.location.hash, function (profile, id_token, access_token, state) { 
    $cookies.profile = JSON.stringify(profile);
    $location.path('/main');
  });

});

