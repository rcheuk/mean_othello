/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';

var Game = require('../api/game/game.model');


Game.find({}).remove(function() {
  Game.create({
    playerOneTurn: true,
    grid: []
  });
});
