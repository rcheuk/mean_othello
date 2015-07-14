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
var utilities = require('./game.utilities');


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
  var game = findAvailableMoves(req.body, true);
  Game.create(game, function(err, game) {
    if(err) { return handleError(res, err); }
    return res.json(201, game);
  });
};

// Updates an existing game in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Game.findById(req.params.id, function (err, game) {
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
  var data = req.body;
  var move = {
    xPos: data.xMove,
    yPos: data.yMove
  };
  var gameObject = data.game;

  if (gameObject.playerOneTurn) {
    gameObject.grid[move.xPos].tiles[move.yPos].isBlack = true;
    gameObject.grid[move.xPos].tiles[move.yPos].isEmpty = false;
  } else {
    gameObject.grid[move.xPos].tiles[move.yPos].isWhite = true;
    gameObject.grid[move.xPos].tiles[move.yPos].isEmpty = false;
  }
  gameObject = reverseTiles(gameObject, move);
  gameObject = findAvailableMoves(gameObject, false, move);

  // set active player
  gameObject.playerOneTurn = !gameObject.playerOneTurn;

  // update game
  Game.findById(gameObject._id, function(err, gameResult) {
    if (err) { return handleError(res, err);}
    if (!gameObject) { return res.send(404); }
    var updated = _.merge(gameResult, gameObject);
    updated.save(function(err) {
      if (err) { return handleError(res, err); }
        return res.json(200, gameResult);
    });
  });
};

var DIRECTIONS = utilities.directions();

// reverseTiles
var reverseTiles = function(game, move) {
  // reverseTiles based on the move performed
  // scan 8 directions to check for tile reversals
  console.log('reversing tiles');
  var isBlack = game.grid[move.xPos].tiles[move.yPos].isBlack;
  for (var direction in DIRECTIONS){
    var xStart = move.xPos, yStart = move.yPos;
    flipTiles(direction, xStart, yStart, isBlack, game)
  }
  return game;
}

var flipTiles = function(direction, xMove, yMove, isBlack, game) {
  
}

// identifies available moves
var findAvailableMoves = function(game, newGame, move) {
  var grid = game.grid;
  var queue = new Queue();
  var startX, startY;
  var isBlack;
  if (newGame) {
    // preset available moves, since they never change
    grid[4].tiles[5].isAvailableMove = true;
    grid[5].tiles[4].isAvailableMove = true;
    grid[3].tiles[2].isAvailableMove = true;
    grid[2].tiles[3].isAvailableMove = true;
  } else {
      // use last move as starting point for identifying available moves
      startX = move.xPos;
      startY = move.yPos;
  }
  return game;
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
