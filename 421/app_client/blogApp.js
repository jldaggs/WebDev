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
app.factory('AuthService', ['$window', '$rootScope', function($window, $rootScope) {
    var authToken = null;

    function parseToken(token) {
        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(atob(base64));
    }    
    
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
        getUserEmail: function() {
            var token = this.getToken();
            if (token) {
                var decoded = parseToken(token);
                return decoded.email; 
            }
            return null;
        },
        isLoggedIn: function() {
            var token = this.getToken();
            return !!token;

        },
        getUserId: function() {
            var token = this.getToken();
            if (token) {
                var payload = parseToken(token);
                return payload.userId; 
            }
            return null;
        },
        logout: function() {
            $window.localStorage.removeItem('blog-app-token');
            authToken = null;
            $rootScope.$broadcast('authChange');
        },
    };
}]);

// Controllers for blog operations
app.controller('blogListController', ['$scope', '$http', '$rootScope', 'AuthService', function($scope, $http, $rootScope, AuthService) {
    $scope.blogs = [];
    $scope.currentUserId = AuthService.getUserId(); 

    function loadBlogs() {
        $http.get('/api/blog').then(function(response) {
            $scope.blogs = response.data.map(blog => ({
                ...blog,
                isCurrentUserAuthor: blog.blogAuthor && blog.blogAuthor._id === $scope.currentUserId
            }));
        }, function(error) {
            console.error('Error fetching blogs:', error);
        });
    }

  
    loadBlogs();


    $rootScope.$on('authChange', function() {
        $scope.currentUserId = AuthService.getUserId(); 
        loadBlogs(); 
    });
}]);


app.controller('blogAddController', ['$scope', '$http', '$location', 'AuthService', function($scope, $http, $location, AuthService) {
    $scope.blog = {};
    $scope.addBlog = function() {
        $http.post('/api/blog', $scope.blog, {headers: {'Authorization': 'Bearer ' + AuthService.getToken()}}).then(function(response) {
            $location.path('/blogs');
        }, function(error) {
            console.error('Error adding blog:', error);
            $scope.errorMessage = "Error adding blog" + error.data.error;
        });
    };
}]);

app.controller('blogEditController', ['$scope', '$http', '$routeParams', '$location', 'AuthService', function($scope, $http, $routeParams, $location, AuthService) {
    $scope.blog = {};
    $http.get('/api/blog/' + $routeParams.id).then(function(response) {
        $scope.blog = response.data;
    }, function(error) {
        console.error('Error fetching blog:', error);
        $scope.errorMessage ='Failed to load the blog for editing.';
    });

    // Function to save changes to the blog
    $scope.saveChanges = function() {
        $http.put('/api/blog/' + $scope.blog._id, $scope.blog, {
            headers: {'Authorization': 'Bearer ' + AuthService.getToken()}
        }).then(function(response) {
            $location.path('/blogs'); 
        }, function(error) {
            console.error('Error updating blog:', error);
            if (error.status === 403) {
                $scope.errorMessage = 'Unauthorized: You can only edit your own posts.';
            } else {
                $scope.errorMessage = 'Failed to update the blog. Please try again.';
            }
        });
    };
}]);

app.controller('blogDeleteController', ['$scope', '$http', '$routeParams', '$location', 'AuthService', function($scope, $http, $routeParams, $location, AuthService) {
    $scope.loadBlogDetails = function() {
        $http.get('/api/blog/' + $routeParams.id).then(function(response) {
            $scope.blog = response.data;
        }, function(error) {
            console.error('Error fetching blog:', error);
            $scope.errorMessage= 'Failed to load blog: ' + error.data.error;
        });
    };

    $scope.deleteBlog = function() {
            $http.delete('/api/blog/' + $routeParams.id, {
                headers: {'Authorization': 'Bearer ' + AuthService.getToken()}
            }).then(function(response) {
                $location.path('/blogs'); // Redirect after delete
            }, function(error) {
                $scope.errorMessage = 'Error deleting blog:', error.data.error;
                $scope.errorMessage = 'Failed to delete blog: ' + error.data.error;
            });
    };

    $scope.loadBlogDetails();
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

