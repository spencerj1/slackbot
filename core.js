
var slackify = angular.module('slackify', []);

function mainController($scope, $http){
	$scope.formData = {};

	$http.get('/data')
	.success(function(data) {
            $scope.todos = data;
            console.log(data);
        })
        .error(function(data) {
            console.log('Error: ' + data);
        });
}