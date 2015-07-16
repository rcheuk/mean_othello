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

  // retrieve db instance of game
  Game.findById(data.game._id, function(err, gameResult) {
    if (err) { return handleError(res, err);}
    if (!gameResult) { return res.send(404); }
		// handle changes on db instance of game
		if (gameResult.playerOneTurn) {
			gameResult.grid[move.xPos].tiles[move.yPos].isBlack = true;
		} else {
			gameResult.grid[move.xPos].tiles[move.yPos].isWhite = true;
		}

		gameResult.grid[move.xPos].tiles[move.yPos].isEmpty = false;
		gameResult.grid[move.xPos].tiles[move.yPos].isAvailableMove = false;

		var isNewGame = false;
		gameResult = reverseTiles(gameResult, move);

		// set active player
		gameResult.playerOneTurn = !gameResult.playerOneTurn;

		gameResult = findAvailableMoves(gameResult, isNewGame, move);

    gameResult.save(function(err) {
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
  var isBlack = game.grid[move.xPos].tiles[move.yPos].isBlack;
  for (var direction in DIRECTIONS){
    var xStart = move.xPos, yStart = move.yPos;
    game = flipTiles(direction, xStart, yStart, isBlack, game)
  }
  return game;
}

/**
For simplicity and readability, this function might be a bit more verbose than needed
in terms of how it was written; could potentially be optimized, but maybe that
will be saved for a later date.
**/
var flipTiles = function(direction, xMove, yMove, isBlack, game) {
  //console.log('direction in flip', direction);
  var x = +xMove + +DIRECTIONS[direction].x, y = +yMove + +DIRECTIONS[direction].y;
  var q = new Queue();
  try {
    // bounds check
    while (x > -1 && y > -1 && x < 8 && y < 8) {
      var next = game.grid[x].tiles[y];
      if (next) {
				// if new piece is black;
        if (!next.isEmpty) {
          if (isBlack) {
  					if (next.isWhite) {
  						// opposite colors, add to stack, and keep going
  						q.enqueue(next);
  					} else if (next.isBlack) {
  						// once find same color, flip colors
  						while (q.size() > 0) {
  							var cell = q.dequeue();
  							cell.isBlack = !cell.isBlack;
  							cell.isWhite = !cell.isWhite;
  						}
  					} else {
  							// no match, but found a potential move?
  							if (q.size() > 0) {
  								q.clear();
  							}
  					}
  				} else {
  					if (next.isBlack) {
  						q.enqueue(next);
  					} else if (next.isWhite) {
  						while (q.size() > 0) {
  							var cell = q.dequeue();
  							cell.isBlack = !cell.isBlack;
  							cell.isWhite = !cell.isWhite;
  						}
  					} else {
  						if (q.size() > 0) {
  							q.clear();
  						}
  					}
  				}
        } else {
          if (q.size() > 0) {
            q.clear();
          }
          break;
        }
      }
      // next coordinate
      x = x + DIRECTIONS[direction].x;
      y = y + DIRECTIONS[direction].y;
    }
    return game;
  } catch (err) {
    console.log('err', err);
  }
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
      game.playerOneScore = 0;
      game.playerTwoScore = 0;
			var pieces = [];
			// scan board to find all pieces
			for (var x = 0; x < grid.length; x++) {
				for (var y = 0; y < grid[x].tiles.length; y++) {
          var tile = grid[x].tiles[y];
					if (!tile.isEmpty) {
						// if tile not empty, add to array
						pieces.push({ xPos: x, yPos: y});
            // check current score
            if (tile.isBlack) {
              game.playerOneScore += 1;
            } else if (tile.isWhite) {
              game.playerTwoScore += 1;
            }
					}
					// reset move availability
					grid[x].tiles[y].isAvailableMove = false;
				}
			}
			// iterate over pieces to search for available moves
			for (var index = 0; index < pieces.length; index++) {
				var gridX = pieces[index].xPos, gridY = pieces[index].yPos;
				for (var direction in DIRECTIONS){
					identifyAvailableMoves(gridX, gridY, game, direction);
				}
			}
  }
  return game;
};

/**
look for possible moves
*/
var identifyAvailableMoves = function(x, y, game, direction) {
	// current piece
	var piece = game.grid[x].tiles[y];
  // next location based on direction
	var nextX = x + DIRECTIONS[direction].x, nextY = y + DIRECTIONS[direction].y;
	// black piece?
  var isBlack = game.playerOneTurn;
	var q = new Queue();
  var foundMoves = false;
	try {
    // bounds check
    while (nextX > -1 && nextY > -1 && nextX < 8 && nextY < 8) {
      // next piece to check
      var next = game.grid[nextX].tiles[nextY];
      if (next) {
				// while pieces remain, keep checking
				if (!next.isEmpty) {
					// if player one's turn, looking for a beginning black piece and end of white
					if (isBlack && piece.isBlack) {
						if (next.isWhite) {
							q.enqueue(next);
						} else {
              // if piece is the same color, then dont need to search further
              // no valid moves in this direction
							break;
						}
					} else if (!isBlack && piece.isWhite) {
						if (next.isBlack) {
							q.enqueue(next);
						} else {
							break;
						}
					}
				} else {
          // if some pieces were found along the way to be opposite color
          // and an end piece of the same initial piece was found
					if (q.size() > 0) {
            foundMoves = true;
						next.isAvailableMove = true;
					}
					break;
				}
				nextX = nextX + DIRECTIONS[direction].x;
				nextY = nextY + DIRECTIONS[direction].y;
			}
		}
    game.gameOver = game.gameOver && !foundMoves;
		q.clear();
	} catch (err) {
		console.log('err', err);
	}
}

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
