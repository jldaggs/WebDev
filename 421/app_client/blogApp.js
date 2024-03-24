var app = angular.module('blogApp', ['ngRoute']);

app.config(function($routeProvider) {
    $routeProvider
        .when('/blogs', {
            templateUrl: '/views/blogList.html',
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
});

app.controller('blogListController', ['$scope', '$http', function($scope, $http) {
    $scope.blogs = [];

    $http.get('/api/blogs').then(function(response) {
        $scope.blogs = response.data;
    }, function(error) {
        console.error('Error fetching blogs:', error);
    });
}]);


app.controller('blogAddController', ['$scope', '$http', '$location', function($scope, $http, $location) {
    $scope.blog = {}; // Model for the form

    $scope.addBlog = function() {
        $http.post('/api/blogs', $scope.blog).then(function(response) {
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

    $http.get('/api/blogs/' + $routeParams.id).then(function(response) {
        $scope.blog = response.data;
    }, function(error) {
        console.error('Error fetching blog:', error);
    });

    $scope.saveChanges = function() {
        $http.put('/api/blogs/' + $scope.blog._id, $scope.blog).then(function(response) {
            // Navigate back to the blog list using $location
            $location.path('/blogs');
        }, function(error) {
            console.error('Error updating blog:', error);
        });
    };
}]);

app.controller('blogDeleteController', ['$scope', '$http', '$routeParams', '$location', function($scope, $http, $routeParams, $location) {
    // Initially fetch the blog details to show to the user
    $http.get('/api/blogs/' + $routeParams.id).then(function(response) {
        $scope.blog = response.data;
    }, function(error) {
        console.error('Error fetching blog:', error);
    });

    $scope.deleteBlog = function(id) {
        $http.delete('/api/blogs/' + id).then(function(response) {
            // After successful deletion, redirect to the blog list
            $location.path('/blogs');
        }, function(error) {
            console.error('Error deleting blog:', error);
        });
    };
}]);