angular.module("northApp",["ngRoute","leaflet-directive","ngMaterial","ngMessages","ngAnimate"]),angular.module("northApp").config(["$routeProvider","$locationProvider",function(a,b){a.when("/",{templateUrl:"/views/home.html",controller:"HomeController",controllerAs:"hc"}).when("/map",{templateUrl:"/views/map.html",controller:"MapController",controllerAs:"mc"}),b.html5Mode(!0)}]);