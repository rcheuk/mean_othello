'use strict';

angular.module('Grid')
.directive('tile', function() {

  return {
      restrict: 'A',
  		scope: {
  			xPos: '=xindex',
  			yPos: '=yindex',
        availableMove: '=available',
        move: '=clickTile'
  		},
  		link: function(scope, element, attrs) {
      		element.bind('click', function () {
            scope.move(scope.xPos, scope.yPos);
      		});
      }
    };
});
