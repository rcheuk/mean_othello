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

// process the Move
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
  findAvailableMoves(game);
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

// identifies available moves
var findAvailableMoves = function(game) {

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
