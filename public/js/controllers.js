// For todays date
Date.prototype.today = function(){ 
    return ((this.getDate() < 10) ? "0" : "") + this.getFullYear() + "-" + (((this.getMonth() + 1) < 10) ? "0" : "") + (this.getMonth() + 1) + "-" + this.getDate();
};
// For the time now
Date.prototype.timeNow = function(){
     return ((this.getHours() < 10) ? "0" : "") + this.getHours() + ":" + ((this.getMinutes() < 10) ? "0" : "") + this.getMinutes() + ":" + ((this.getSeconds() < 10) ? "0" : "") + this.getSeconds();
};

// Define a new module for our app. The array holds the names of dependencies if any.
var app = angular.module("faradayLaundry", []);

app.factory('socket', function ($rootScope) {
  var socket = io.connect();
  return {
    on: function (eventName, callback) {
      socket.on(eventName, function () {  
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      })
    }
  };
});

function updateTime ($scope) {
	var newDate = new Date();
	$scope.last_updated = newDate.today() + " @ " + newDate.timeNow();
}

app.controller('OrderFormController', function ($scope, $http, socket) {
	// Define the model properties. The view will loop
	// through the machines array and genreate a li
	// element for every one of its items.
	$scope.machines = [] //machines.getMachines();

	socket.on('machines', function (data) {
		$scope.machines = data;
	});

	socket.on('updated_machine', function (data) {
		console.log(data);
		for (var i = 0, len = $scope.machines.length; i < len; i++) {
			console.log($scope.machines[i]);
			if (data.name == $scope.machines[i].name) {
				$scope.machines[i].status = data.status;
			}
		}
		updateTime($scope);
	});

	$scope.toggleStatus = function (s) {
		if (s.status == "available") {
			s.status = "in use";
		} else if (s.status == "in use") {
			s.status = "broken";
		} else {
			s.status = "available";
		}
		socket.emit('update_machine', {'name': s.name, 'status': s.status})
		updateTime($scope);
	};
});