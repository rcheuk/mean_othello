'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
This will store the game settings.

**/
var GameSchema = new Schema({
  playerOneTurn: Boolean,
  grid: [{ tiles: [{isBlack: Boolean, isWhite: Boolean, isEmpty: Boolean, isAvailableMove: Boolean}] }] //row of tiles
});

module.exports = mongoose.model('Game', GameSchema);
