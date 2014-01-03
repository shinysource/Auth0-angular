(function () {

  var auth0 = angular.module('auth0', ['ngCookies']);

  function Auth0WidgetWrapper(auth0Widget, $cookies, $rootScope) {
    this.auth0Widget = auth0Widget;
    this.$cookies    = $cookies;
    this.$rootScope  = $rootScope;
  }

  Auth0WidgetWrapper.prototype = {};

  Auth0WidgetWrapper.prototype.signin = function (options) {
    if (this.auth0Widget.signin) {
      this.auth0Widget.signin(options);
    } else {
      this.auth0Widget.login(options);
    }
  };

  Auth0WidgetWrapper.prototype.signout = function (pathToRedirect) {
    this.$cookies.profile = undefined;
    this.$cookies.idToken = undefined;
    this.$cookies.accessToken = undefined;

    this.profile = undefined;
    this.isAuthenticated = false;
    this.idToken = undefined;
    this.accessToken = undefined;
  };

  Auth0WidgetWrapper.prototype.parseHash = function (locationHash, callback) {
    this.auth0Widget.parseHash(locationHash, callback);
  };

  Auth0WidgetWrapper.prototype.signup = function (options) {
    this.auth0Widget.signup(options);
  };

  Auth0WidgetWrapper.prototype.reset = function (options) {
    this.auth0Widget.reset(options);
  };

  auth0.provider('auth', function () {
    var auth0WidgetWrapper, auth0Widget;

    this.init = function (options) {
      if (options.callbackOnLocationHash === undefined) {
        options.callbackOnLocationHash = true;
      }

      // User has included widget
      if (typeof Auth0Widget !== 'undefined') {
        auth0Widget = new Auth0Widget(options);
      } else {
        auth0Widget = new Auth0(options);
      }

    };

    this.$get = function ($cookies, $rootScope) {
      if (!auth0Widget) {
        throw new Error('You need add to your config Auth0 initialization');
      }

      if (!auth0WidgetWrapper) {
        auth0WidgetWrapper = new Auth0WidgetWrapper(auth0Widget, $cookies, $rootScope);
      }

      return auth0WidgetWrapper;
    };
  });

  auth0.run(function (auth, $cookies, $location, $rootScope, $timeout, $document) {
    auth.parseHash(window.location.hash, function (profile, id_token, access_token, state) {
      $cookies.profile = JSON.stringify(profile);
      $cookies.idToken = id_token;
      $cookies.accessToken = access_token;
      $location.path('/');
    });

    if ($cookies.profile) {
      auth.profile = JSON.parse($cookies.profile);
      auth.isAuthenticated = !!$cookies.profile;
      auth.idToken = $cookies.idToken;
      auth.accessToken = $cookies.accessToken;
    }
  });

  var authInterceptorModule = angular.module('authInterceptor', ['auth0']);

  authInterceptorModule.factory('authInterceptor', function (auth, $rootScope) {
    return {
      request: function (config) {
        config.headers = config.headers = {};
        if (auth.idToken) {
          config.headers.Authorization = 'Bearer '+ auth.idToken;
        }
        return config;
      },
      response: function (response) {
        // handle the case where the user is not authenticated
        if (response.status === 401) {
          $rootScope.$broadcast('auth:forbidden', response);
        }
        return response || $q.when(response);
      }
    };
  });

  authInterceptorModule.config(function ($httpProvider) {
    $httpProvider.interceptors.push('authInterceptor');
  });

}());
