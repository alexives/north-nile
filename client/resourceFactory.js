angular.module('northApp').factory('ResourceFactory', ['$http', function($http){
  var savedResources = [];
  var pendingResources = [];
  var approvedResources = [];
  var mapResources = {};
  var userResources = [];
  var geocodeKey = 'd757d21efc7d5efeb1195e398d031a5e';

  var getUserResources = function(user){
    console.log('trying to log user', user);
    $http.get('/resources/user/' + user.info.id).then(function(response){
      console.log(response);
      angular.copy(response.data, userResources);
    });
  };

  var saveNewResource = function(resource){
    $http.get('https://api.opencagedata.com/geocode/v1/json?q=' + resource.location + '&key=' + geocodeKey).then(function(response){
      console.log('Geocode response:', response);
      if(response.data.results[0]){
        resource.latitude = response.data.results[0].geometry.lat;
        resource.longitude = response.data.results[0].geometry.lng;
      }      
      $http.post('/resources/new', resource).then(function(response){
        console.log('Save new resource response:', response);
        getSavedResources();
      });
    }, function(response){
      console.log('Geocode failed:', response);
      // save marker even on fail?
      $http.post('/resources/new', resource).then(function(response){
        console.log('Save new resource response:', response);
        getSavedResources();
      });
    });
  };

  var getSavedResources = function(callback){
    $http.get('/resources/all').then(function(response){
      console.log('Got all saved resources:', response.data);
      angular.copy(response.data, savedResources);

      var tempPendingResources = savedResources.filter(function(resource){
        if (resource.is_pending === true){
          // console.log('resource is pending',resource);
          return true;
        }
      });

      var tempApprovedResources = savedResources.filter(function(resource){
        if (resource.is_active === true){
          // console.log('resource is active',resource);
          return true;
        }
      });

      var count = 0;
      tempApprovedResources.map(function(resource){
        resource.lat = Number(resource.latitude); // convert to number and format for Leaflet
        resource.lng = Number(resource.longitude); // convert to number and format for Leaflet

        mapResources['m'+count] = resource;
        count++
      });

      angular.copy(tempPendingResources, pendingResources);
      angular.copy(tempApprovedResources, approvedResources);
      if(callback){
        callback('all'); // run filterMarkers callback if present
      }
    });
  };

  var updateResource = function(resource){
    // needs to be like a post route
    $http.put('/resources/update', resource).then(function(response){
      console.log('Updated resource:', response);
      getSavedResources();
    });
  };

  var removeResource = function(resource){
    var id = resource.id;
    $http.delete('/resources/remove/' + id).then(function(response){
      console.log('Removed resources:', response);
      getSavedResources();
    });
  };


  return {
    saveNewResource: saveNewResource,
    getSavedResources: getSavedResources,
    savedResources: savedResources,
    pendingResources: pendingResources,
    approvedResources: approvedResources,
    updateResource: updateResource,
    mapResources: mapResources,
    getUserResources: getUserResources,
    userResources: userResources,
    removeResource: removeResource
  }
}]);
