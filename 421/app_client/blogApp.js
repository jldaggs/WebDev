var app = angular.module('blogApp', ['ngRoute']);
console.log("AngularJS module loaded:", app);

app.config(function($routeProvider) {
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
        .otherwise({
            redirectTo: '/blogs'
        });
});

app.controller('blogListController', ['$scope', '$http', function($scope, $http) {
    console.log("blogListController initialized");

    $scope.blogs = [];

    $http.get('/api/blog').then(function(response) {
        console.log(response.data)
        $scope.blogs = response.data;
    }, function(error) {
        console.error('Error fetching blogs:', error);
    });
}]);


app.controller('blogAddController', ['$scope', '$http', '$location', function($scope, $http, $location) {
    $scope.blog = {}; // Model for the form

    $scope.addBlog = function() {
        $http.post('/api/blog', $scope.blog).then(function(response) {
            // Handle success, redirect to the blog list using $location
            $location.path('/blogs');
        }, function(error) {
            // Handle error
            console.error('Error adding blog:', error);
        });
    };
}]);

app.controller('blogEditController', ['$scope', '$http', '$routeParams', '$location', function($scope, $http, $routeParams, $location) {
    $scope.blog = {};

    $http.get('/api/blog/' + $routeParams.id).then(function(response) {
        $scope.blog = response.data;
    }, function(error) {
        console.error('Error fetching blog:', error);
    });

    $scope.saveChanges = function() {
        $http.put('/api/blog/' + $scope.blog._id, $scope.blog).then(function(response) {
            // Navigate back to the blog list using $location
            $location.path('/blogs');
        }, function(error) {
            console.error('Error updating blog:', error);
        });
    };
}]);

app.controller('blogDeleteController', ['$scope', '$http', '$routeParams', '$location', function($scope, $http, $routeParams, $location) {
    // Initially fetch the blog details to show to the user
    $http.get('/api/blog/' + $routeParams.id).then(function(response) {
        $scope.blog = response.data;
    }, function(error) {
        console.error('Error fetching blog:', error);
    });

    $scope.deleteBlog = function(id) {
        $http.delete('/api/blog/' + id).then(function(response) {
            // After successful deletion, redirect to the blog list
            $location.path('/blogs');
        }, function(error) {
            console.error('Error deleting blog:', error);
        });
    };
}]);