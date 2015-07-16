'use strict';

angular.module('reversiApp', ['Game',
  'ngCookies',
  'ngRoute',
  'ngAnimate',
  'btford.socket-io'
])
  .config(function ($routeProvider) {
    $routeProvider
    .when('/', {
        templateUrl: 'app/main.html'
      });
  })
  /**
  The game controller runs when the user enters the page. It checks the browser
  for a 'game session', identified by an id. If one exists, it will retrieve the
  game session from the server. Otherwise it will create one.
  */
  .controller('MainController', function(GameService, $scope) {
    this.game = GameService;

    // creates a new game
    this.loadOrCreateGame = function() {
      // check browser if game exists
      if (localStorage && localStorage['othelloGameId']) {
        var gameId = localStorage['othelloGameId'];
        if (gameId) {
          GameService.getGame(gameId, function(game) {
            $scope.game = game;
          });
        }
      } else {
        GameService.createGame(function (game) {
          $scope.game = game;
          if (localStorage) {
            localStorage['othelloGameId'] = game._id;
          }
        });
      }
    }

    this.loadOrCreateGame();
    /* processes a user move */
    this.move = function(xPos, yPos) {
      GameService.processMove(xPos, yPos, $scope.game, function(result) {
        $scope.game = result;
      });
    }

    /* deletes current game from database and creates a new one */
    this.restart = function() {
      delete localStorage['othelloGameId'];
      GameService.deleteGame($scope.game._id, function(result) {
        if (result) {
          console.log('delete successul');
        }
      });
      this.loadOrCreateGame();
    }
});
