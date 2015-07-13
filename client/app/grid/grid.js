'use strict';

angular.module('Grid', [])
.factory('TileFactory', function() {
  var tileFactory = {};

  tileFactory.getTile = function() {
    var tile = {
      isBlack: false,
      isWhite: false,
      isEmpty: true,
      isAvailableMove: false
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
      self.grid[x] = [];
      for (var y = 0; y < service.size; y++) {
        self.grid[x][y] = TileFactory.getTile();
      }
    }
    // set inital pieces
    self.grid[4][4].isWhite = true;
    self.grid[4][5].isBlack = true;
    self.grid[5][4].isBlack = true;
    self.grid[5][5].isWhite = true;
  };
  return this;
});
