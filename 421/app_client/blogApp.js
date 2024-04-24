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

angular.module('blogApp').factory('Socket', ['$rootScope', function($rootScope) {
    var socket = io.connect();
    return {
        on: function(eventName, callback) {
            socket.on(eventName, function() {
                var args = arguments;
                $rootScope.$apply(function() {
                    callback.apply(socket, args);
                });
            });
        },
        emit: function(eventName, data, callback) {
            socket.emit(eventName, data, function() {
                var args = arguments;
                $rootScope.$apply(function() {
                    if (callback) {
                        callback.apply(socket, args);
                    }
                });
            });
        }
    };
}]);

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

//*********************************************************************************Blogs******************************************************************************************************* */
app.controller('blogListController', ['$scope', '$http', '$rootScope', 'AuthService','Socket', function($scope, $http, $rootScope, AuthService, Socket) {
    $scope.blogs = [];

    function loadBlogs() {
        $http.get('/api/blog').then(function(response) {
            $scope.blogs = response.data.map(blog => ({
                ...blog,
                isLikedByUser: blog.likedBy.includes(AuthService.getUserId()),
                isCurrentUserAuthor: blog.blogAuthor._id === AuthService.getUserId(),
                authorName: blog.blogAuthor ? blog.blogAuthor.name : 'Unknown Author'
            }));
        });
    }


    var likeUpdatedListener = function(data) {
        var blog = $scope.blogs.find(b => b._id === data.blogId);
        if (blog) {
            blog.likeCount = data.likeCount;
            blog.isLikedByUser = data.liked;
        }
    };

    Socket.on('likeUpdated', likeUpdatedListener);

    $scope.$on('$destroy', function() {
        Socket.removeListener('likeUpdated', likeUpdatedListener);
    });

    $scope.toggleLike = function(blog) {
        console.log("Toggling like for blog:", blog._id);
        if (!AuthService.isLoggedIn()) {
            alert('Please log in to like posts.');
            return;
        }
        var token = AuthService.getToken();
        if (!token) {
            console.error('Authentication token is missing.');
            return;
        }
        console.log("Token is:", token);

        $http.post('/api/blog/' + blog._id + '/like', {}, {
            headers: { 'Authorization': `Bearer ${token}` }
        }).then(function(response) {
            if (response.data.success) {
                blog.likeCount = response.data.likeCount;
                blog.isLikedByUser = response.data.liked;
            }
            loadBlogs();
        }).catch(function(error) {
            console.error('Error toggling like:', error);
            alert('Failed to toggle like. Please try again.');
        });
    };
    

    
    
    $rootScope.$on('authChange', function() {
        loadBlogs();  // This will reload the blogs whenever the authentication state changes
    });
    

    loadBlogs();
}]);





app.controller('blogAddController', ['$scope', '$http', '$location', 'AuthService', function($scope, $http, $location, AuthService) {
    $scope.blog = {};

    // Initialize blogAuthor if needed
    $scope.blog.blogAuthor = AuthService.getUserId(); // Ensure AuthService has a method to get the current user's ID.

    $scope.addBlog = function() {
        console.log("Data being sent:", $scope.blog);
        $http.post('/api/blog', $scope.blog, {
            headers: {'Authorization': 'Bearer ' + AuthService.getToken()}
        }).then(function(response) {
            $location.path('/blogs');
        }, function(error) {
            console.error('Error adding blog:', error);
            if (error.data) {
                console.log('Error details:', error.data);
            }
        });
    };
}]);




app.controller('blogEditController', ['$scope', '$http', '$routeParams', '$location', 'AuthService', function($scope, $http, $routeParams, $location, AuthService) {
    $scope.blog = {};
    $http.get('/api/blog/' + $routeParams.blogId).then(function(response) {
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
    $http.get('/api/blog/' + $routeParams.blogId).then(function(response) {
        $scope.blog = response.data;
    }, function(error) {
        console.error('Error fetching blog:', error);
    });
    $scope.deleteBlog = function() {
        $http.delete('/api/blog/' + $routeParams.blogId, {
            headers: {'Authorization': 'Bearer ' + AuthService.getToken()}
        }).then(function(response) {
            $location.path('/blogs');
        }, function(error) {
            console.error('Error deleting blog:', error);
        });
    };
    
}]);


//*****************************************************************************Comments***************************************************************************************************** */
app.controller('blogCommentListController', ['$scope', '$http', '$routeParams', 'AuthService', function($scope, $http, $routeParams, AuthService) {
    $scope.blog = {};
    $scope.comments = [];

    // Function to fetch blog by ID
    $scope.fetchBlog = function() {
        $http.get('/api/blog/' + $routeParams.blogId, {headers: {'Authorization': 'Bearer ' + AuthService.getToken()}}).then(function(response) {
            $scope.blog = response.data;
        }, function(error) {
            console.error('Error fetching blog', error);
        });
    };

    // Fetch comments from the server
    $scope.fetchComments = function() {
        $http.get(`/api/blog/${$routeParams.blogId}/comments`).then(function(response) {
            $scope.comments = response.data;
        }, function(error) {
            console.error('Error fetching comments:', error);
        });
    };

    // Initialize the fetching process for both blog and comments
    $scope.fetchBlog();
    $scope.fetchComments();

}]);



app.controller('blogCommentAddController', ['$scope', '$http', '$routeParams', '$location', 'AuthService', function($scope, $http, $routeParams, $location, AuthService) {
    
    $scope.comment = {};

    $scope.fetchData = function() {
        // Fetch the blog
        $http.get(`/api/blog/${$routeParams.blogId}`).then(function(response) {
            $scope.blog = response.data;
        }, function(error) {
            console.error('Error fetching blog:', error);
        });
    };

    $scope.addComment = function() {
        $http.post('/api/blog/' + $routeParams.blogId + '/comments', $scope.comment, {
            headers: { 'Authorization': 'Bearer ' + AuthService.getToken() }
        }).then(function(response) {
            $location.path('/blogs/comment/' + $routeParams.blogId); // Redirect after successful post
        }, function(error) {
            console.error('Error adding comment:', error);
        });
    };

 
    $scope.fetchData();
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

    // Logout function handling
    $rootScope.logout = function() {
        AuthService.logout(); // Ensure logout clears the token
        $rootScope.$broadcast('authChange');
        $location.path('/login'); // Redirect to login page
    };

    // Event for when a user logs in
    $rootScope.$on('login', function() {
        $rootScope.$broadcast('authChange');
    });

    // Event for when a user logs out
    $rootScope.$on('logout', function() {
        AuthService.clearToken(); // Clear the authentication token
        $rootScope.$broadcast('authChange');
    });

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

