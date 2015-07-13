'use strict';

/**
This game's architect and design was loosely inspired by an Angular implementation
of 2048: http://d.pr/pNtX
**/
angular.module('Game', ['Grid', 'ngCookies'])
.factory('GameModel', function() {
  var gameFactory = {};
  gameFactory.getGame = function() {
    var game = {};
    game.playerOneTurn = true;
    game.grid = null;
    return game;
  }
  return gameFactory;
})
.service('GameService', function($q, $timeout,
  GridService, $cookieStore, $http, GameModel){

  this.grid = GridService.grid;

  this.reinit = function() {
    this.gameOver = false;
    this.playerOneScore = 0;
    this.playerTwoScore = 0;
  };

  this.reinit();

  this.getGame = function(id, callback) {
    $http.get('/api/games/' + id).success( function(game) {
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
    this.reinit();
  }

  this.processMove = function(x, y, _game) {
    var move = {
      xMove: x,
      yMove: y,
      game: _game
    }
    $http.post('/api/games/processMove', move).success(function (game) {
      callback(game);
    });

  }

  this.movesAvailable = function() {

  };

  this.updateScore = function() {

  };

});
