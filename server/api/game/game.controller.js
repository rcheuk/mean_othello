/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /games              ->  index
 * POST    /games              ->  create
 * GET     /games/:id          ->  show
 * PUT     /games/:id          ->  update
 * DELETE  /games/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
var Game = require('./game.model');
var Queue = require('queue-fifo');

// Get list of games
exports.index = function(req, res) {
  Game.find(function (err, games) {
    if(err) { return handleError(res, err); }
    return res.json(200, games);
  });
};

// Get a single game
exports.show = function(req, res) {
  Game.findById(req.params.id, function (err, game) {
    if(err) { return handleError(res, err); }
    if(!game) { return res.send(404); }
    return res.json(game);
  });
};

// Creates a new game in the DB.
exports.create = function(req, res) {
  Game.create(req.body, function(err, game) {
    if(err) { return handleError(res, err); }
    return res.json(201, game);
  });
};

// Updates an existing game in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  game.findById(req.params.id, function (err, game) {
    if (err) { return handleError(res, err); }
    if(!game) { return res.send(404); }
    var updated = _.merge(game, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, game);
    });
  });
};

// process a move by setting the color of the played move,
// then call a method to flip the necessary tiles
// and recalculate the available moves
// update the game in the database
exports.processMove = function(req, res) {
  var move = req.body;
  var xPos = move.xMove;
  var yPos = move.yMove;
  var game = move.game;

  if (game.playerOneTurn) {
    game.grid[xPos].tiles[yPos].isBlack = true;
    game.grid[xPos].tiles[yPos].isEmpty = false;
  } else {
    game.grid[xPos].tiles[yPos].isWhite = true;
    game.grid[xPos].tiles[yPos].isEmpty = false;
  }
  game.playerOneTurn = !game.playerOneTurn;
  game = reverseTiles(game, move);
  game = findAvailableMoves(game);
  // there probably is a way to combine the two methods above, so
  // reversing occurs while also identifying additional moves?

  // update game
  game.findById(game._id, function(err, gameResult) {
    if (err) { return handleError(res, err);}
    if (!game) { return res.send(404); }
    var updated = _.merge(gameResult, game);
    updated.save(function(err) {
      if (err) { return handleError(res, err); }
        return res.json(200, gameResult);
    });
  });
  return res.json(200, req.body);
};

// reverseTiles
var reverseTiles = function(game, move) {
  // reverseTiles based on the move performed
}

// identifies available moves
var findAvailableMoves = function(game) {
  var grid = game.grid;
  var queue = new Queue();
  var next = state;
  var startX = 0, startY = 0;
  var isBlack;
  // scan all directions for available moves

};

// Deletes a game from the DB.
exports.destroy = function(req, res) {
  Game.findById(req.params.id, function (err, game) {
    if(err) { return handleError(res, err); }
    if(!game) { return res.send(404); }
    game.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}
