# Auth0 with AngularJS

This tutorial will show you how to add Auth0 to a single page AngularJS app. The AngularJS app will consume a REST API as described by the [Using Auth0 in Node.JS APIs Tutorial](https://docs.auth0.com/nodeapi-tutorial).

First of all, include the Auth0 widget and auth0 module script tags:
```html
<!-- Auth0 Widget dependency -->
<script src="//d19p4zemcycm7a.cloudfront.net/w2/auth0-widget-2.3.js" type="text/javascript"> </script>
<script src="./scripts/auth0.js" type="text/javascript"> </script>
```

### Routes

Let's start configuring the routes. You will typically want three routes for the Authentication flow:
 * `/login`:  The route that will allow the user to input their credentials.
 * `/logout`: The route that the user will follow in order to close its session.
 * `/main`:   A route where you are going to display some restricted content (like for instance, a dashboard).

Add the following router configuration to the `.config` block:
```js

$routeProvider
.when('/main',    { templateUrl: 'views/main.html',     controller: 'MainCtrl'    })
.when('/logout',  { templateUrl: 'views/logout.html',   controller: 'LogoutCtrl'  })
.when('/login',   { templateUrl: 'views/login.html',    controller: 'LoginCtrl'   })

.otherwise({ redirectTo: '/login' });
```

### Controllers
Next step in this tutorial is to add the required logic to controllers. Let's start by showing the widget on the `Login` controller. In order to do that, first, we need to include the Auth0 module as a dependency of the app main module:
```js
var app = angular.module('myApp', ['auth0']);
```

After doing that, we are going to add the `auth0` among the injected objects. We are going to call the `login` method that displays the widget. :

```js
myApp.controller('LoginCtrl', function ($scope, auth0) {
  auth0.login();
});
```
Bear in mind that you can specify as first parameter the relative hash URL that you want to redirect the user after it successfully logs in. This parameter defaults to `/main`.

Then, on logout let's call `auth0`'s same named method:
```js
myApp.controller('LogoutCtrl', function ($scope, auth0) {
  auth0.logout();
});
```

Same as login, you can use the first parameter of logout to determine where the redirect will take the user. By default, it goes back to `/login`.

On the main controller, or any other controller where you need the user to be logged in just you will need to do the following:

```js
myApp.controller('MainCtrl', function ($scope, $location, $http, auth0) {
  if (auth0.isAuthenticated()) {
    $scope.message = "Welcome " + auth0.currentUser().name;
  } else {
    $location.path('/login');
  }
};
```

#### Sending a request from the controllers
Last step in the tutorial is to consume a protected part of the API from one of the controllers.

We start by changing the `Main` controller's template and provide a way of executing the request to the protected resource:
```html
<div>
  <br />
  <span>{{message}}</span>
  <div><a href="" ng-click="sendProtectedMessage()">Send Protected Message</a></div>
</div>
```

`Main` controller must be modified to handle that click and perform a GET on the resource located on `/api/protected`:

```js
myApp.controller('MainCtrl', function ($scope, $cookies, $location, $http) {
  if (auth0.isAuthenticated()) {
    $scope.message = "Welcome " + auth0.currentUser().name;
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
```

A custom Auth0 `$http` interceptor handles the call, adds the `Authorization` header and the request works. From an users perspective all the controller logic regarding XHR calls will remain the same.
