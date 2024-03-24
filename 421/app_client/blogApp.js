var app = angular.module('blogApp', ['ngRoute']);

app.config(function($routeProvider) {
    $routeProvider
        .when('/blogs', {
            templateUrl: '/blogs',
            controller: 'blogListController'
        })
        .when('/blogs/add', {
            templateUrl: '/blogs/add', 
            controller: 'blogAddController'
        })
        .when('/blogs/edit/:id', {
            templateUrl: '/blogs/edit/:id', // Use the ID from the route parameter
            controller: 'blogEditController'
        })
        .when('/blogs/delete/:id', {
            templateUrl: '/blogs/delete/:id',
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


app.controller('blogAddController', ['$scope', '$http', function($scope, $http) {
    $scope.blog = {}; // Model for the form

    $scope.addBlog = function() {
        $http.post('/api/blogs', $scope.blog).then(function(response) {
            // Handle success, redirect to the blog list
            window.location.href = '#!/blogs';
        }, function(error) {
            // Handle error
            console.error('Error adding blog:', error);
        });
    };
}]);

app.controller('blogEditController', ['$scope', '$http', '$routeParams', function($scope, $http, $routeParams) {
    $scope.blog = {};

    $http.get('/api/blogs/' + $routeParams.id).then(function(response) {
        $scope.blog = response.data;
    }, function(error) {
        console.error('Error fetching blog:', error);
    });

    $scope.saveChanges = function() {
        $http.put('/api/blogs/' + $scope.blog._id, $scope.blog).then(function(response) {
            // Navigate back to the blog list 
            window.location.href = '#!/blogs';
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