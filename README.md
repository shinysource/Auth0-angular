# Auth0 with AngularJS

This tutorial will show you how to add Auth0 to a single page AngularJS app. The AngularJS app will consume a REST API as described by the [Using Auth0 in Node.JS APIs Tutorial](https://docs.auth0.com/nodeapi-tutorial).

### Auth0Widget

First of all, include the Auth0 widget script tag:
```html
<!-- Auth0 Widget dependency -->
<script src="//d19p4zemcycm7a.cloudfront.net/w2/auth0-widget-2.3.js" type="text/javascript"> </script>
```

We will initialize the Auth0 widget in a [`module.run`](http://docs.angularjs.org/api/angular.Module) block. The idea here is to create an instance that we can access from the login controller. You will need to complete here with your [Auth0 app information](https://app.auth0.com/#/applications):

```js
  $rootScope.Auth0Widget = new Auth0Widget({
      domain: 'your.domain.com',
      clientID: 'YOUR_CLIENT_ID',
      callbackURL: 'YOUR_CALLBACK_URL',

      /* As we are creating a single page application
       * in order to handle the redirect we need to send
       * the user to a hash URL */
      callbackOnLocationHash: true
  });
```

What the Auth0 widget will do is perform the authentication. After that, it will redirect the user to a hash URL inside our AngularJS app. On that way, we are going to grab authentication data such as user profile and the token required to communicate to the API. Note that `$cookies` can be replaced with `sessionStorage` if you don't need to support old browsers.

```js
$rootScope.Auth0Widget.parseHash(window.location.hash, function (profile, id_token, access_token) {
  // Store the user profile as JSON using cookies (cannot persist as object)
  $cookies.profile = JSON.stringify(profile);

  // Token we will use to talk to server
  $cookies.idToken = id_token;

  // After successfully login redirect to main. You main want to change
  // this for a dashboard url.
  $location.path('/main');
});
```

So the resulting `run` block will look like:
```js
.run(function ($rootScope, $cookies, $location) {
  // We add the widget to the $rootScope so we can access it from the Login controller
  $rootScope.Auth0Widget = new Auth0Widget({
      domain: 'your.domain.com',
      clientID: 'YOUR_CLIENT_ID',
      callbackURL: 'YOUR_CALLBACK_URL',
      callbackOnLocationHash: true
  });

    $rootScope.Auth0Widget.parseHash(window.location.hash, function (profile, id_token, access_token) {
    $cookies.profile = JSON.stringify(profile);
    $cookies.idToken = id_token;
    $location.path('/main');
  });
})
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
Next step in this tutorial is to add the required logic to controllers. Let's start by triggering the widget to be shown in the `Login` controller:

```js
myApp.controller('LoginCtrl', function ($scope, $rootScope) {
  $rootScope.Auth0Widget.signin();
});
```

Then, let's erase `profile` and `idToken` from the cookies on user logout:
```js
myApp.controller('LogoutCtrl', function ($scope, $cookies, $location) {
  $cookies.profile = undefined;
  $cookies.idToken = undefined;
  $location.path('/login');
});
```

On the main controller, or any other controller where you need the user to be logged in just you will need to do the following:

```js
myApp.controller('MainCtrl', function ($scope, $cookies, $location, $http) {
  if ($cookies.profile) {
    $scope.message = "Welcome " + JSON.parse($cookies.profile).name;
  } else {
    $location.path('/login');
  }
};
```

Moreover, you can extract this logic in a factory, so you don't need to perform these checks everywhere.

### Consuming a RESTful API

In order to consume a RESTful API you will need to use the previously saved `id_token` (a [JWT](http://self-issued.info/docs/draft-ietf-oauth-json-web-token.html)). So for instance, if you have an existing request using [$http](http://docs.angularjs.org/api/ng.$http) you will need to modify it adding the Authorization header as follows:

```js
$http({ method: 'GET', url: '/foo', headers: {'Authorization': 'Bearer ' + $cookies.idToken })
.success(function (data, status, headers, config) {
  // ...
})
.error(function (data, status, headers, config) {
  // ...
});
```

On that way your Node.js server knows that you have been authenticated by Auth0.

So, what happens if you have to perform many requests in different places? Do you need to modify every occurrence of $http? If you are using Angular 1.1.x or above you can use a [Request Interceptor](http://docs.angularjs.org/api/ng.$http) to modify the request and add the Authorization header:

```js
.factory('auth0RequestInterceptor', function ($cookies) {
  return {
    request: function (config) {
      if ($cookies.idToken) {
        config.headers = {'Authorization':'Bearer '+ $cookies.idToken};
        return config;
      }
    }
  };
});
```

Also, you will need to register it to the $httpProvider in the `.config`:
```js
// Adding custom Auth0 request interceptor
$httpProvider.interceptors.push('auth0RequestInterceptor');
```

##### Angular 1.0.x

In case you are using Angular 1.0.x you can achieve the same by doing:
```js
$http.defaults.headers.common['Authorization'] = 'Bearer ' + $cookies.idToken;
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
  if ($cookies.profile) {
    $scope.message = "Welcome " + JSON.parse($cookies.profile).name;
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

The `$http` interceptor handles the call, adds the `Authorization` header and the request works. From an users perspective all the controller logic regarding XHR calls will remain the same but now the server can determine whether is authenticated or not.
