'use strict';

/**
This game's architect and design was loosely inspired by an Angular implementation
of 2048: http://d.pr/pNtX

though, at the end of this writing, it has diverged signficantly.
**/
angular.module('Game', ['Grid', 'ngCookies'])
.factory('GameModel', function() {
  var gameFactory = {};
  gameFactory.getGame = function() {
    var game = {};
    game.playerOneTurn = true;
    game.playerOneScore = 0;
    game.playerTwoScore = 0;
    game.availableMovesRemain = true;
    game.gameOver = false;
    game.grid = null;
    return game;
  }
  return gameFactory;
})
.service('GameService', function($q, $timeout,
  GridService, $cookieStore, $http, GameModel){

  this.grid = GridService.grid;

  this.getGame = function(id, callback) {
    if (id) {
      $http.get('/api/games/' + id).success( function(game) {
        callback(game);
      });
    }
  }

  this.deleteGame = function(id, callback) {
    $http.delete('/api/games/' + id).success( function(game) {
      callback(game);
    });
  }

  this.createGame = function(callback) {
    var gameObject = GameModel.getGame();
    GridService.buildEmptyGameBoard();
    gameObject.grid = GridService.getGrid();
    $http.post('/api/games', gameObject).success(function(result) {
      if (result) {
        console.log('result');
        callback(result);
      } else {
        callback(null);
      }
    });
  }

  this.processMove = function(x, y, _game, callback) {
    var move = {
      xMove: x,
      yMove: y,
      game: _game
    }
    $http.post('/api/games/processMove', move).success(function (game) {
      callback(game);
    });
  }
});
