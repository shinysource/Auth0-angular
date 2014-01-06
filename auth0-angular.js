(function () {

  var auth0 = angular.module('auth0', ['ngCookies']);

  function Auth0Wrapper(auth0Lib, $cookies, $rootScope) {
    this.auth0Lib = auth0Lib;
    this.$cookies    = $cookies;
    this.$rootScope  = $rootScope;
  }

  Auth0Wrapper.prototype = {};

  Auth0Wrapper.prototype.signin = function (options) {
    var that = this;
    this.auth0Lib.signin(options, function (err) {
      that.$rootScope.$broadcast('auth:login-error', err);
    });
  };

  Auth0Wrapper.prototype.signout = function () {
    this.$cookies.profile = undefined;
    this.$cookies.idToken = undefined;
    this.$cookies.accessToken = undefined;

    this.profile = undefined;
    this.isAuthenticated = false;
    this.idToken = undefined;
    this.accessToken = undefined;
  };

  Auth0Wrapper.prototype.parseHash = function (locationHash, callback) {
    this.auth0Lib.parseHash(locationHash, callback);
  };

  Auth0Wrapper.prototype.signup = function (options) {
    this.auth0Lib.signup(options);
  };

  Auth0Wrapper.prototype.reset = function (options) {
    this.auth0Lib.reset(options);
  };

  auth0.provider('auth', function () {
    var auth0Wrapper, auth0Lib;

    this.init = function (options) {
      if (options.callbackOnLocationHash === undefined) {
        options.callbackOnLocationHash = true;
      }

      // User has included widget
      if (typeof Auth0Widget !== 'undefined') {
        auth0Lib = new Auth0Widget(options);
      } else {
        auth0Lib = new Auth0(options);
      }

    };

    this.$get = function ($cookies, $rootScope) {
      if (!auth0Lib) {
        throw new Error('You need add to your config Auth0 initialization');
      }

      if (!auth0Wrapper) {
        auth0Wrapper = new Auth0Wrapper(auth0Lib, $cookies, $rootScope);
      }

      return auth0Wrapper;
    };
  });

  auth0.run(function (auth, $cookies, $location, $rootScope) {
    auth.parseHash(window.location.hash, function (profile, id_token, access_token, state) {
      $cookies.profile = JSON.stringify(profile);
      $cookies.idToken = id_token;
      $cookies.accessToken = access_token;
      $location.path('/');
    }, function (err) {
      $rootScope.$broadcast('auth:error', err);
    });

    if ($cookies.profile) {
      auth.profile = JSON.parse($cookies.profile);
      auth.isAuthenticated = !!$cookies.profile;
      auth.idToken = $cookies.idToken;
      auth.accessToken = $cookies.accessToken;
    }
  });

  var authInterceptorModule = angular.module('authInterceptor', ['auth0']);

  authInterceptorModule.factory('authInterceptor', function (auth, $rootScope, $q) {
    return {
      request: function (config) {
        config.headers = config.headers || {};
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
