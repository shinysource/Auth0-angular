# Auth0 with AngularJS

This tutorial will show you how to add Auth0 to a single page AngularJS app.

This App will authenticate the user both on client and server sides. Create a new account in Auth0 and choose your server side technology ([Node.JS](https://docs.auth0.com/nodeapi-tutorial), [PHP](https://docs.auth0.com/phpapi-tutorial), [ASP.NET](https://docs.auth0.com/aspnetwebapi-tutorial) or [Ruby](https://docs.auth0.com/rubyapi-tutorial) among others)

1. Include the Auth0 widget and [auth0 module script](/app/scripts/auth0.js) tags:
    ```html
    <!-- Auth0 Widget dependency -->
    <script src="//d19p4zemcycm7a.cloudfront.net/w2/auth0-widget-2.3.js" type="text/javascript"> </script>
    <script src="./scripts/auth0.js" type="text/javascript"> </script>
    ```

2. Then we need to include the Auth0 module as a dependency of the app main module:
    ```js
    var app = angular.module('myApp', ['auth0']);
    ```

3. Configure AuthProvider with your Auth0 information inside a `.config` section.
    ```js
    myApp.config(function ($routeProvider, authProvider) {
      ...
      authProvider.init({
        domain: 'your.domain.com',
        clientID: 'YOUR_CLIENT_ID',
        callbackURL: 'http://localhost:1337/',
        callbackOnLocationHash: true
      });
    });
  ```

4. Let's configure the routes. We are going to configure three routes for the Authentication flow but you may use a single route or as many routes as you want:
 * `/login`:  The route that will allow the user to input their credentials.
 * `/logout`: The route that the user will follow in order to close its session.
 * `/`:   A route where you are going to display some restricted content (like for instance, a dashboard).
Add the following router configuration to the `.config` block.  

    ```js
    myApp.config(function ($routeProvider, authProvider) {
    
      ...
    
      $routeProvider
      .when('/',        { templateUrl: 'views/root.html',     controller: 'RootCtrl'    })
      .when('/logout',  { templateUrl: 'views/logout.html',   controller: 'LogoutCtrl'  })
      .when('/login',   { templateUrl: 'views/login.html',    controller: 'LoginCtrl'   })
    
      .otherwise({ redirectTo: '/login' });
    });
    ```

5. Now you can inject the `auth` service in your controllers and call the `signin`/`signout` methods. 
  ```js
  myApp.controller('LoginCtrl', function ($scope, auth) {
    auth.signin();
  });
  ```

  Then, on `signout` let's call `auth`'s same named method:

  ```js
  myApp.controller('LogoutCtrl', function ($scope, auth) {
    auth0.signout();
  });
  ```

6. Use the `auth.profile` object to show user attributes in the view.
  ```js
  myApp.controller('RootCtrl', function ($scope, $location, $http, auth) {

    ...

    $scope.user = auth.profile;
  };
  ```
  The template of that controller will be:
  ```html
  <div>
    <br />
    <span>Welcome {{user.name}}!</span>
  </div>
  ```

## Calling an API
On this section we are going to consume a protected part of the API from one of the controllers.


1. Add to you application a new factory called `authRequestInterceptor`. This factory is going to intercept the HTTP request and add the required Authorization header.
  ```js
  myApp.factory('authRequestInterceptor', function (auth) {
    return {
      request: function (config) {
        config.headers = config.headers = {};
        if (auth.idToken) {
          config.headers.Authorization = 'Bearer '+ auth.idToken;
        }
        return config;
      }
    };
  });
  ```

2. Add to a config section of your app the following snippet:
  ```js
  myApp.config(function ($httpProvider) {
  
    ...
  
    $httpProvider.interceptors.push('auth0RequestInterceptor');
  });
  ```
That will make the $http use that interceptor by default for all the XHR requests.

3. Use `$http` from your controller in order to make the request.
  ```js
  $scope.sendProtectedMessage = function () {
    $http({method: 'GET', url: '/api/protected'})
      .success(function (data, status, headers, config) {
        $scope.message = 'Protected data was: ' + data;
      });
  };
  ```

The controller performs a GET on the resource located on `/api/protected` when `sendProtectedMessage` is called. A custom Auth0 `$http` interceptor handles the call, adds the `Authorization` header and the request works. From an users perspective all the controller logic regarding XHR calls will remain the same.
