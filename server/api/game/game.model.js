'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
This will store the game settings.

**/
var GameSchema = new Schema({
  playerOneTurn: Boolean,
  playerOneScore: 0,
  playerTwoScore: 0,
  availableMovesRemain: Boolean,
  gameOver: Boolean,
  grid: [{ tiles: [{isBlack: Boolean, isWhite: Boolean, isEmpty: Boolean, isAvailableMove: Boolean, xPosition: 0, yPosition: 0 }] }] //row of tiles
});

module.exports = mongoose.model('Game', GameSchema);
