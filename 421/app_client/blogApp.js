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
        .when('/blogs/edit/:blogId', {
            templateUrl: 'views/blogEdit.html',
            controller: 'blogEditController'
        })
        .when('/blogs/delete/:blogId', {
            templateUrl: 'views/blogDelete.html',
            controller: 'blogDeleteController'
        })
        .when('/blogs/comment/:blogId',{
            templateUrl: 'views/blogCommentList.html',
            controller: 'blogCommentListController'
        })
        .when('/blogs/comment/add/:blogId', {
            templateUrl: 'views/blogCommentAdd.html',
            controller: 'blogCommentAddController'
        })
        .when('/blogs/comment/edit/:blogId/:commentId', {
            templateUrl: 'views/blogCommentEdit.html',
            controller: 'blogCommentEditController'
        })
        .when('/blogs/comment/delete/:blogId/:commentId', {
            templateUrl: 'views/blogCommentDelete.html',
            controller: 'blogCommentDeleteController'
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

app.factory('AuthService', ['$window', function($window) {
    var authToken = null;

    function parseToken(token) {
        var base64Url = token.split('.')[1]; // Extract the payload of the JWT
        var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(window.atob(base64));
    }
    
    return {
        saveToken: function(token) {
            console.log("Saving token:", token);
            $window.localStorage.setItem('blog-app-token', token);
            authToken = token;
        },
        getToken: function() {
            if (!authToken) {
                authToken = $window.localStorage.getItem('blog-app-token');
                console.log("Retrieved token from storage:", authToken);
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
            if (token) {
                var payload = parseToken(token);
                return payload.exp > Date.now() / 1000; 
            }
            return false;
        },        
        logout: function() {
            $window.localStorage.removeItem('blog-app-token');
            authToken = null;
        }
    };
}]);


//*********************************************************************************Blogs******************************************************************************************************* */
app.controller('blogListController', ['$scope', '$http', function($scope, $http) {
    console.log("blogListController initialized");
    $scope.blogs = [];
    $http.get('/api/blog').then(function(response) {
        console.log(response.data);
        $scope.blogs = response.data;
    }, function(error) {
        console.error('Error fetching blogs:', error);
    });
    $scope.toggleLike = function(blog) {
        if (!AuthService.isLoggedIn()) {
            $rootScope.openLoginModal(); // Show login modal instead of alert
            return;
        }
        
        BlogService.toggleLike(blog._id).then(function(response) {
          if (response.data.liked) {
            blog.isLikedByUser = true;
            blog.likeCount++;
          } else {
            blog.isLikedByUser = false;
            blog.likeCount--;
          }
        });
      };
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


//*****************************************************************************Comments***************************************************************************************************** */
app.controller('blogCommentListController', ['$scope', '$http', '$routeParams', 'AuthService', function($scope, $http, $routeParams, AuthService) {
    $scope.comments = [];

    // Fetch comments from the server
    $scope.fetchComments = function() {
        $http.get(`/api/blog/${$routeParams.blogId}/comments`).then(function(response) {
            $scope.comments = response.data;
        }, function(error) {
            console.error('Error fetching comments:', error);
        });
    };

    // Toggle like on a comment
    $scope.toggleLike = function(comment) {
        if (!AuthService.isLoggedIn()) {
            $rootScope.openLoginModal(); // Show login modal instead of alert
            return;
        }

        // Assuming a similar BlogService or CommentService exists for handling likes
        CommentService.toggleLike(comment._id).then(function(response) {
            if (response.data.liked) {
                comment.isLikedByUser = true;
                comment.likesCount++;
            } else {
                comment.isLikedByUser = false;
                comment.likesCount--;
            }
        }, function(error) {
            console.error('Error toggling like on comment:', error);
        });
    };

    $scope.fetchComments();
}]);


app.controller('blogCommentAddController', ['$scope', '$http', '$routeParams', '$location', 'AuthService', function($scope, $http, $routeParams, $location, AuthService) {
    $scope.blog = {};
    $scope.comment = {};

    // Function to fetch blog by ID
    $scope.fetchBlog = function() {
        $http.get('/api/blog/' + $routeParams.blogId, {headers: {'Authorization': 'Bearer ' + AuthService.getToken()}}).then(function(response) {
            $scope.blog = response.data;
        }, function(error) {
            console.error('Error fetching blog', error);
        });
    };

    // Function to add a comment
    $scope.addComment = function() {
        $http.post('/api/blog/' + $routeParams.blogId + '/comments', $scope.comment, {headers: {'Authorization': 'Bearer ' + AuthService.getToken()}}).then(function(response) {
            $location.path('/blogs/comment/' + $routeParams.blogId);
        }, function(error) {
            console.error('Error adding comment:', error);
        });
    };

    // Initialize by fetching the blog
    $scope.fetchBlog();
}]);


app.controller('blogCommentEditController', ['$scope', '$http', '$routeParams', '$location', 'AuthService', function($scope, $http, $routeParams, $location, AuthService) {
    $scope.blog = {};
    $scope.comment = {};

    // Fetch the blog and the comment
    $scope.fetchData = function() {
        // Fetch the blog
        $http.get(`/api/blog/${$routeParams.blogId}`).then(function(response) {
            $scope.blog = response.data;
        }, function(error) {
            console.error('Error fetching blog:', error);
        });

        // Fetch the specific comment
        $http.get(`/api/blog/${$routeParams.blogId}/comments/${$routeParams.commentId}`).then(function(response) {
            $scope.comment = response.data;
        }, function(error) {
            console.error('Error fetching comment:', error);
        });
    };

    // Update the comment
    $scope.saveChanges = function() {
        $http.put(`/api/blog/${$routeParams.blogId}/comments/${$routeParams.commentId}`, $scope.comment, {
            headers: {'Authorization': 'Bearer ' + AuthService.getToken()}
        }).then(function(response) {
            $location.path(`/blogs/comment/${$routeParams.blogId}`);
        }, function(error) {
            console.error('Error updating comment:', error);
        });
    };

    // Call fetch data on controller initialization
    $scope.fetchData();
}]);

app.controller('blogCommentDeleteController', ['$scope', '$http', '$routeParams', '$location', 'AuthService', function($scope, $http, $routeParams, $location, AuthService) {
    $scope.blog = {};
    $scope.comment = {};

    // Fetch the blog and the specific comment
    $scope.fetchData = function() {
        // Fetch the blog
        $http.get(`/api/blog/${$routeParams.blogId}`).then(function(response) {
            $scope.blog = response.data;
        }, function(error) {
            console.error('Error fetching blog:', error);
        });

        // Fetch the specific comment
        $http.get(`/api/blog/${$routeParams.blogId}/comments/${$routeParams.commentId}`).then(function(response) {
            $scope.comment = response.data;
        }, function(error) {
            console.error('Error fetching comment:', error);
        });
    };

    // Delete the comment
    $scope.deleteComment = function() {
        $http.delete(`/api/blog/${$routeParams.blogId}/comments/${$routeParams.commentId}`, {
            headers: {'Authorization': 'Bearer ' + AuthService.getToken()}
        }).then(function(response) {
            $location.path(`/blogs/comment/${$routeParams.blogId}`);
        }, function(error) {
            console.error('Error deleting comment:', error);
        });
    };

    // Call fetch data on controller initialization
    $scope.fetchData();
}]);


//********************************************************************************User Auth****************************************************************************************************** */
app.controller('loginController', ['$scope', '$rootScope', '$http', '$location', 'AuthService', function($scope, $rootScope, $http, $location, AuthService) {
    $scope.user = {};

    $scope.login = function() {
        $http.post('/api/login', $scope.user).then(function(response) {
            if (response.data.token) {
                AuthService.saveToken(response.data.token);
                $rootScope.closeLoginModal(); // Close the modal on successful login
                $location.path('/blogs'); // Redirect to blogs
            } else {
                $scope.errorMessage = "Invalid login response";
            }
        }, function(error) {
            console.error('Error during login:', error);
            $scope.errorMessage = "Login failed: " + (error.data && error.data.message ? error.data.message : "Unknown error");
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

app.run(['$rootScope', '$location', 'AuthService', function($rootScope, $location, AuthService) {
    // Assign AuthService to rootScope for global access
    $rootScope.AuthService = AuthService;

    // Modal visibility flag
    $rootScope.showLoginModal = false;

    // Function to open the login modal
    $rootScope.openLoginModal = function() {
        $rootScope.showLoginModal = true;
    };

    // Function to close the login modal
    $rootScope.closeLoginModal = function() {
        $rootScope.showLoginModal = false;
    };

    // Global logout function
    $rootScope.logout = function() {
        AuthService.logout();
        $location.path('/login'); // Use $location for SPA navigation
    };

    // Watch for changes in authentication status to close the modal if logged in
    $rootScope.$watch(function() {
        return AuthService.isLoggedIn();
    }, function(isLoggedIn) {
        if (isLoggedIn && $rootScope.showLoginModal) {
            $rootScope.closeLoginModal();
        }
    });

    // Redirect to login if not authenticated when required
    $rootScope.$on('$routeChangeStart', function(event, next, current) {
        if (next.requiresAuth && !AuthService.isLoggedIn()) {
            event.preventDefault(); // Prevent navigating to the route
            $rootScope.openLoginModal(); // Show login modal instead
        }
    });
}]);



