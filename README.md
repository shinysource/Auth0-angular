# Auth0 and AngularJS

This AngularJS module will help you implement client-side and server-side (API) authentication. You can use it together with [Auth0](https://www.auth0.com) to add username/password authentication, support for enterprise identity like Active Directory or SAML and also for social identities like Google, Facebook or Salesforce among others to your web, API and mobile native apps. 

[Auth0](https://www.auth0.com) is a cloud service that provides a turn-key solution for authentication, authorization and Single Sign On.

# Tutorial

For this tutorial, you need to create a new account in [Auth0](https://www.auth0.com) and setup a new application. We will then implement client side and server side auth.

## Client Side Authentication

1. There are two ways of implementing signin/singup. One is using our [Login Widget](https://docs.auth0.com/login-widget2), which is a complete Login UI ready to use and the other one is using the [JavaScript SDK](https://github.com/auth0/auth0.js) which is just a wrapper to our API so you can build your UI on top. 
    ```html
    <!-- login widget -->
    <script src="//d19p4zemcycm7a.cloudfront.net/w2/auth0-widget-2.3.js" type="text/javascript"> </script>
    ```
    _- or -_

    ```html
    <!-- auth0.js and build your own UI -->
    <script src="https://d19p4zemcycm7a.cloudfront.net/w2/auth0-1.2.8.min.js"></script>
    ```
    
2.  Add the [Auth0 Angular module](auth0-angular.js):
    ```js
    <script src="https://raw.github.com/auth0/auth0-angular/master/auth0-angular.js" type="text/javascript"> </script>
    ```

2. Include the Auth0 module as a dependency of the app main module:
    ```js
    var app = angular.module('myApp', ['auth0']);
    ```

3. Inject and initiate the `auth` service in the app main config block with your `domain`, `clientID` and `callbackURL` (get them from Auth0 dashboard in the Application settings).
    ```js
    myApp.config(function ($routeProvider, authProvider) {
      ...
      authProvider.init({
        domain: 'yourdomain.auth0.com',
        clientID: 'YOUR_CLIENT_ID',
        callbackURL: 'http://localhost:1337/',
        callbackOnLocationHash: true
      });
    });
  ```

4. You can configure three routes for the Authentication flow (or just one and show/hide the login UI, whatever you prefer):
 * `/login`:  The route that will allow the user to input their credentials.
 * `/logout`: The route that the user will follow in order to close its session.
 * `/`:   A route where you are going to display some restricted content.
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

  > Note: We are currently using Angular's ngRoute but any other routing library can be used.

5. Inject the `auth` service in your controllers and call the `signin`/`signout` methods. 
  ```js
  myApp.controller('LoginCtrl', function ($scope, auth) {
    auth.signin();
  });
  ```

  ```js
  myApp.controller('LogoutCtrl', function ($scope, auth) {
    auth0.signout();
  });
  ```

  > More details about the parameters you can use for the [Auth0 Login Widget](https://docs.auth0.com/login-widget2) and [auth0.js](https://github.com/auth0/auth0.js). 

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

## Server Side Authentication

Now that the user was authenticated on the client side, you want to make sure that every time an API is called, the user attributes are sent in a secure way. The `auth` service that you used before also provides a `token` which is a signed [JSON Web Token](http://tools.ietf.org/html/draft-jones-json-web-token). This token can be sent through an HTTP header and the backedn API can validaate it without any extra roundtrip (since the token has been signed with a secret that is shared between the API and Auth0).

1. Add to you application the `authInterceptor` dependency (it's included in the same auth0-angular.js file).
    
  ```js
  var myApp = angular.module('myApp', [
    'ngCookies', 'ngRoute', 'auth0', 'authInterceptor'
  ]);
  ```

2. Use `$http` from your controller in order to make the request.
  ```js
    $http({method: 'GET', url: '/api/protected'})
      .success(function (data, status, headers, config) {
        // User authenticated, do something with the response
        ...
      })
      .error(function (data, status, headers, config) {
        ...
      });
  ```

  > NOTE: behind the scenes, the `authInterceptor` will add the JSON Web Token to each request. Something like: `config.headers.Authorization = 'Bearer '+ auth.idToken;`


3. If the JSON Web Token (`JWT`) has expired or has been tampered, you can handle that case here:

    ```js
        $rootScope.$on('auth:forbidden', function (event, response) {
            // handle the case where the JWT is not valid (401 status code)
            auth.signout();
            $location.path('/login');        
        });
    ```
> Note: the JWT expiration can be controlled from the Auth0 dashboard

On the backed you can use any JWT library to validate the token. Here are some:
* [ASP.NET Web API](https://docs.auth0.com/aspnetwebapi-tutorial)
* [Node.js API](https://docs.auth0.com/nodeapi-tutorial)
* [Ruby API](https://docs.auth0.com/rubyapi-tutorial)
* [PHP API](https://docs.auth0.com/phpapi-tutorial)

---

## Bonus tracks

### Redirect to route if user is not authenticated

If you have multiple routes and you want to control what routes are anonymous, what routes need authentication and even do some custom logic to decide whether or not the user can access a route, read below.

#### Apprach 1: embedded in the controller (the simplest)

The simplest way would be handling it at the controller level.

```js
myApp.controller('RootCtrl', function (auth, $scope, $location, $http) {
  if (!auth.isAuthenticated) {
    $location.path('/login');
    return;
  }
  
  // user is authenticated
}
```

#### Apprach 2: at the router level

You could also do something at the routing level. Our module is not coupled with any particular implementation of Angular routing, so you can choose the default `ngRoute`, the [ui-router](https://github.com/angular-ui/ui-router) or some other custom module like [Angular Routing](https://github.com/dotJEM/angular-routing).

This [article](https://medium.com/p/4e927af3a15f) explains such approach using the [ui-router](https://github.com/angular-ui/ui-router)

```js
angular.module("myApp")
  .run(function ($rootScope, $state, auth) {
    $rootScope.$on("$stateChangeStart", function(curr, prev){
      if (curr.authenticate && !auth.isAuthenticated){
        // User isn’t authenticated
        $state.transitionTo("login");
      }
    });
  });
```

> The `authenticate` attribute is a boolean that you add to your routing table specifying that the route needs authentication. Read more about this approach in the [article](https://medium.com/p/4e927af3a15f).


### Examples

There are two examples:

* [widget]: a simple angular app doing auth with social and username/password using the Login Widget.
* [custom-login]: same as the previous one but without using the widget, just a custom login form.

The server side is using node.js and you can run it with `npm install && node app.js`. It is pre-configured with a demo account with Amazon, Facebook, Google and username/password credentials.

![](https://dl.dropboxusercontent.com/s/6fm04vrom8ojcby/angular.gif?dl=1)

---

## What is Auth0?

Auth0 helps you to:

* Add authentication with [multiple authentication sources](https://docs.auth0.com/identityproviders), either social like **Google, Facebook, Microsoft Account, LinkedIn, GitHub, Twitter, Box, Salesforce, amont others**, or enterprise identity systems like **Windows Azure AD, Google Apps, Active Directory, ADFS or any SAML Identity Provider**. 
* Add authentication through more traditional **[username/password databases](https://docs.auth0.com/mysql-connection-tutorial)**.
* Add support for **[linking different user accounts](https://docs.auth0.com/link-accounts)** with the same user.
* Support for generating signed [Json Web Tokens](https://docs.auth0.com/jwt) to call your APIs and **flow the user identity** securely.
* Analytics of how, when and where users are logging in.
* Pull data from other sources and add it to the user profile, through [JavaScript rules](https://docs.auth0.com/rules).

## Create a free account in Auth0

1. Go to [Auth0](http://developers.auth0.com) and click Sign Up.
2. Use Google, GitHub or Microsoft Account to login.

## License

The MIT License (MIT)

Copyright (c) 2013 AUTH10 LLC

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
