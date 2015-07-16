'use strict';

angular.module('reversiApp')
  .controller('NavbarCtrl', function ($scope, $location) {
    this.menu = [{
      'title': 'Home',
      'link': '/'
    }];

    this.isCollapsed = true;

    this.isActive = function(route) {
      return route === $location.path();
    };
  });