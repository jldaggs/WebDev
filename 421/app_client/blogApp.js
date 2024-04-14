var app = angular.module('blogApp', ['ngRoute']);
console.log("AngularJS module loaded:", app);

// Configuring routes
app.config(['$routeProvider', function($routeProvider) {
    $routeProvider
        .when('/blogs', {
            templateUrl: 'views/blogList.html',
            controller: 'blogListController'
        })
        .when('/blogs/add', {
            templateUrl: 'views/blogAdd.html',
            controller: 'blogAddController'
        })
        .when('/blogs/edit/:id', {
            templateUrl: 'views/blogEdit.html',
            controller: 'blogEditController'
        })
        .when('/blogs/delete/:id', {
            templateUrl: 'views/blogDelete.html',
            controller: 'blogDeleteController'
        })
        .when('/login', {
            templateUrl: 'views/login.html',
            controller: 'loginController'
        })
        .when('/register', {
            templateUrl: 'views/register.html',
            controller: 'registerController'
        })
        .otherwise({
            redirectTo: '/blogs'
        });
}]);

// AuthService for managing authentication
app.factory('AuthService', ['$window', function($window) {
    var authToken = null;

    return {
        saveToken: function(token) {
            $window.localStorage['blog-app-token'] = token;
            authToken = token;
        },
        getToken: function() {
            if (!authToken) {
                authToken = $window.localStorage['blog-app-token'];
            }
            return authToken;
        },
        isLoggedIn: function() {
            var token = this.getToken();
            return !!token;
        },
        logout: function() {
            $window.localStorage.removeItem('blog-app-token');
            authToken = null;
        }
    };
}]);

// Controllers for blog operations
app.controller('blogListController', ['$scope', '$http', function($scope, $http) {
    console.log("blogListController initialized");
    $scope.blogs = [];
    $http.get('/api/blog').then(function(response) {
        console.log(response.data);
        $scope.blogs = response.data;
    }, function(error) {
        console.error('Error fetching blogs:', error);
    });
}]);

app.controller('blogAddController', ['$scope', '$http', '$location', 'AuthService', function($scope, $http, $location, AuthService) {
    $scope.blog = {};
    $scope.addBlog = function() {
        $http.post('/api/blog', $scope.blog, {headers: {'Authorization': 'Bearer ' + AuthService.getToken()}}).then(function(response) {
            $location.path('/blogs');
        }, function(error) {
            console.error('Error adding blog:', error);
        });
    };
}]);

app.controller('blogEditController', ['$scope', '$http', '$routeParams', '$location', 'AuthService', function($scope, $http, $routeParams, $location, AuthService) {
    $scope.blog = {};
    $http.get('/api/blog/' + $routeParams.id).then(function(response) {
        $scope.blog = response.data;
    }, function(error) {
        console.error('Error fetching blog:', error);
    });
    $scope.saveChanges = function() {
        $http.put('/api/blog/' + $scope.blog._id, $scope.blog, {headers: {'Authorization': 'Bearer ' + AuthService.getToken()}}).then(function(response) {
            $location.path('/blogs');
        }, function(error) {
            console.error('Error updating blog:', error);
        });
    };
}]);

app.controller('blogDeleteController', ['$scope', '$http', '$routeParams', '$location', 'AuthService', function($scope, $http, $routeParams, $location, AuthService) {
    $http.get('/api/blog/' + $routeParams.id).then(function(response) {
        $scope.blog = response.data;
    }, function(error) {
        console.error('Error fetching blog:', error);
    });
    $scope.deleteBlog = function(id) {
        $http.delete('/api/blog/' + id, {headers: {'Authorization': 'Bearer ' + AuthService.getToken()}}).then(function(response) {
            $location.path('/blogs');
        }, function(error) {
            console.error('Error deleting blog:', error);
        });
    };
}]);

// Controllers for user authentication
app.controller('loginController', ['$scope', '$http', '$location', 'AuthService', function($scope, $http, $location, AuthService) {
    $scope.user = {};
    $scope.login = function() {
        $http.post('/api/login', $scope.user).then(function(response) {
            AuthService.saveToken(response.data.token);
            $location.path('/blogs');
        }, function(error) {
            console.error('Error during login:', error);
            $scope.errorMessage = "Login failed: Invalid email or password";
        });
    };
}]);

app.controller('registerController', ['$scope', '$http', '$location', 'AuthService', function($scope, $http, $location, AuthService) {
    $scope.newUser = {};
    $scope.register = function() {
        $http.post('/api/register', $scope.newUser).then(function(response) {
            AuthService.saveToken(response.data.token);
            $location.path('/blogs');
        }, function(error) {
            console.error('Error during registration:', error);
            $scope.errorMessage = "Registration failed: " + error.data.message;
        });
    };
}]);

// Make AuthService globally accessible
app.run(['$rootScope', 'AuthService', function($rootScope, AuthService) {
    $rootScope.AuthService = AuthService;
    $rootScope.logout = function() {
        AuthService.logout();
        window.location = '#!/login';
    };
}]);

