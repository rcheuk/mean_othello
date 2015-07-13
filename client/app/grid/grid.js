'use strict';

angular.module('Grid', [])
.factory('TileFactory', function() {
  var tileFactory = {};

  tileFactory.getTile = function(xPosition, yPosition) {
    var tile = {
      isBlack: false,
      isWhite: false,
      isEmpty: true,
      isAvailableMove: false,
      xPosition: "" + xPosition,
      yPosition: "" + yPosition
    };
    return tile;
  };

  return tileFactory;
})
.service('GridService', function(TileFactory, $http) {
  this.size = 8; // Default size

  this.setSize = function(sz) {
    this.size = sz ? sz : 0;
  };

  var service = this;

  this.getSize = function() {
    return service.size;
  };

  this.getGrid = function() {
    return this.grid;
  }

  // Build game board
  this.buildEmptyGameBoard = function() {
    var self = this;
    // Initialize our grid as multi dimensional array
    self.grid = [];
    for (var x = 0; x < service.size; x++) {
      self.grid[x] = { tiles: [] };
      for (var y = 0; y < service.size; y++) {
        self.grid[x].tiles.push(TileFactory.getTile(x, y));
      }
    }
    // set inital pieces
    self.grid[3].tiles[3].isWhite = true;
    self.grid[3].tiles[3].isEmpty = false;
    self.grid[3].tiles[4].isBlack = true;
    self.grid[3].tiles[4].isEmpty = false;
    self.grid[4].tiles[3].isBlack = true;
    self.grid[4].tiles[3].isEmpty = false;
    self.grid[4].tiles[4].isWhite = true;
    self.grid[4].tiles[4].isEmpty = false;
  };
  return this;
});
