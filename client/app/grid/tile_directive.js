'use strict';

angular.module('Grid')
.directive('tile', function() {

  return {
      restrict: 'A',
  		scope: {
  			xPos: '=xindex',
  			yPos: '=yindex',
        move: '=clickTile'
  		},
  		link: function(scope, element, attrs) {
        // listens for click event, and sends position of tile that was clicked
    		element.bind('click', function () {
          scope.move(scope.xPos, scope.yPos);
    		});
      }
    };
});
