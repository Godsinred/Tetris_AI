// from stackedover flow. used to make a deepy copy of an array since the built in
// functions weren't creating copies properly
function copy(o) {
   var output, v, key;
   output = Array.isArray(o) ? [] : {};
   for (key in o) {
       v = o[key];
       output[key] = (typeof v === "object") ? copy(v) : v;
   }
   return output;
}

// for printing to the console
function printMatrix(matrix)
{
  for(let j = 0; j < matrix.length; ++j)
  {
      console.log(matrix[j]);
  }
}

// the heuristic class we are going to use to evaluate the state of the game
function BestFirstSearch()
{
  this.open = [];
  this.closed = [];
  // this.matrix = Array(ROW).fill().map(() => Array(COLUMN).fill(0));
}

// the main function of the AI that will loop until the game is over
BestFirstSearch.prototype.startAI = function()
{
  // do this until the game is over
  // simulates best first search with bound. After ever bound we want to reset the information
  // so we can't backtrack any further to reduce memory and compute time
  while(!game.gameOver)
  {
    this.open = [];
    this.closed = [];

    // prepares out best first serach with bound. currently slicing 3 elements (bound = 3)
    var tempState = new State(copy(game.matrix), game.listOfNextPieces.slice(0, 3), game.activePiece, game.holdPiece, game.score, "", game.gameOver);
    this.open.append(tempState);

    // runs while there is something in the open list and our next best state has items to check
    // if not this is the state we go to
    while(this.open.length > 0)
    {
      // gets and removes the first item in the open list which will be the best state when sorted
      tempState = this.open.shift();

      if(tempState.listOfNextPieces.length == 0)
      {
        // we found our best state and we can end our bound
        break;
      }

      // generates the next states and put them on the open list
      this.generateNextStates(tempState);

      // after visiting this state we can put it on the closed list
      this.closed.push(tempState);

      // now we can sort the open list
      this.sortOpen();
    }

    // since we have our path we can move the set of pieces on the game board to match our state
    this.movePiece(tempState.path);
  }
}




BestFirstSearch.prototype.generateNextStates = function (curState)
{
  // goes through all of the rotations and checks them one by one
  for(let j = 0; j < currentPiece.tetromino.length; ++j)
  {
    // resets the coordinates for the next piece rotation
    this.y = -2;
    this.x = 3;

    // moves the piece as far left as possible so that we can linearly search each state from left to right
    this.moveFarLeft(currentPiece.tetromino[j]);

    // checks this particular rotation of the tetromino
    var width = this.getActualWidth(currentPiece.tetromino[j])
    for(let k = 0;this.x <= COLUMN - width; ++this.x)
    {
      // move the piece to the very top
      this.y = -2;

      // finds the lowest point where the piece on go in the matrix
      this.hardDrop(currentPiece.tetromino[j]);

      var tempScore = this.score;
      // locks the piece into a temporary matrix that will get returned and
      // then heuristically evaluated
      // needs to use the copy function that i found online inorder to make a deep copy manually
      var tempMatrix = this.tempLock(currentPiece.tetromino[j], copy(this.matrix));

      // to pass that the game is over with this state
      if(this.gameDone)
      {
        var tempState = new State(this.x, this.y, tempMatrix, j, currentPiece.tetromino[j], this.score, tempScore, true);
        this.gameDone = false;
      }
      else
      {
        var tempState = new State(this.x, this.y, tempMatrix, j, currentPiece.tetromino[j], this.score, tempScore, false);
      }

      if(bestState == null)
      {
        bestState = tempState;
      }
      else if (bestState.value < tempState.value)
      {
        // updates the bestState and deletes the old one
        let temp = bestState;
        bestState = tempState;
        delete temp;

      }
      else
      {
          // our current best state is better than this one
          delete tempState;
      }
      this.score = tempScore;
    }
  }
  return bestState;
};

State.prototype.moveFarLeft = function(tetromino)
{
  while(!this.collision(-1, 0, tetromino))
  {
    this.x--;
  }
}

// hard drops the piece to the lowest row it can go and locks it in place
State.prototype.hardDrop = function(tetromino)
{
  while(!this.collision(0, 1, tetromino))
  {
    this.y++;
  }
}

State.prototype.collision = function(offsetX, offsetY, pieceType)
{
  // console.log("BEST first search collision");
  for(i = 0; i < pieceType.length; ++i)
  {
    for(j = 0; j < pieceType.length; ++j)
    {
      // if the piece is empty ( = 0) then we skip it cause it doesn't collide
      if(!pieceType[i][j])
      {
        continue;
      }

      // where the piece is going to be moving to
      let newX = this.x + j + offsetX;
      let newY = this.y + i + offsetY;

      // checks if it will collide with the wall
      if(newX >= COLUMN || newX < 0 || newY >= ROW)
      {
        return true;
      }

      // don't want to index negatively into an array
      // use case: when the piece first spawns it is outside of the canvas
      if(newY < 0)
      {
        continue;
      }

      // checks if there new new spot is not empty
      if(this.matrix[newY][newX] != 0)
      {
        return true;
      }
    }
  }
  // there was no collision
  return false;
}

State.prototype.tempLock = function(tetromino, cur_matrix)
{
    for(let i = 0; i < tetromino.length; ++i)
    {
       for(let j = 0; j < tetromino.length; ++j)
       {
           // ingore the empty/0 indexes
           if( !tetromino[i][j])
           {
               continue;
           }

           // game is over if the piece is locked over the board
           // might change this later so that you lose if the whole piece gets locked above the screen
           if(this.y + i < 0)
           {
               this.gameDone = true;
               return cur_matrix;
           }

           // we lock the piece
          cur_matrix[this.y + i][this.x + j] = 1;
       }
     }

     // removes full rows
     for(let i = 0; i < ROW; ++i)
     {
       let isRowFull = true;
       for(let j = 0; j < COLUMN; ++j)
       {
           isRowFull = isRowFull && (cur_matrix[i][j] != 0);

           // no need to continue if one of the rows is not full
           if(!isRowFull)
           {
             break;
           }
       }

       if(isRowFull)
       {
           // if the row is full
           // we move down all the rows above it
           for(let y = i; y > 0; y--)
           {
               for(let j = 0; j < COLUMN; ++j)
               {
                   cur_matrix[y][j] = cur_matrix[y - 1][j];
               }
           }

           // since we deleted a row there is no row above it
           // this might also change if the definition of game over changes
           for(let j = 0; j < COLUMN; ++j)
           {
               cur_matrix[0][j] = 0;
           }
           // increment the score
           this.score += 10;

       }
   }
   return cur_matrix;
}

// moves the current piece based on the path instructions
State.prototype.movePiece = function(path)
{
  // this will moves the pieces based on the path inputs that the heuristic generated
  // console.log("======= entering function movePiece =======");
  // console.log("path: " + path);
  for(let i = 0; i < path.length; ++i)
  {
    if(path[i] == "L")
    {
      // console.log("MOVING LEFT");
      game.moveLeft();
    }
    else if (path[i] == "R")
    {
      // console.log("MOVING RIGHT");
      game.moveRight();
    }
    else if (path[i] == "C")
    {
      // console.log("ROTATING");
      game.rotate();
    }
    else if (path[i] == "D")
    {
      // console.log("HARD DROP");
      game.hardDrop();
    }
    else if (path[i] == "H")
    {
      // console.log("HARD DROP");
      game.hold();
    }
  }
  // console.log("======= leaving function movePiece =======");
}

// need this so we don't over extend on the right side of the board since moveFarLeft
// goes until there is collision on the left
State.prototype.getActualWidth = function (tetro)
{
  var width = Array(tetro.length).fill(0);

  for(let i = 0; i < tetro.length; ++i)
  {
    for(let j = 0; j < tetro.length; ++j)
    {
      width[j] += tetro[i][j];
    }
  }

  var end = -1;
  for(var i = 0; i < width.length; ++i)
  {
    if(width[i] > 0)
    {
      end = i;
    }
  }
  return end + 1;
};


State.prototype.updatePath = function()
{
  // for which rotation we are using
  this.path += "C".repeat(this.tetrominoN);

  // determines which way the piece will move
  let dirNum = this.x - 3;
  if(dirNum < 0)
  {
    this.path += "L".repeat(Math.abs(dirNum));
  }
  else
  {
    this.path += "R".repeat(dirNum);
  }
  // for putting the piece all the way down
  this.path += "D";
}

// evaluatse the value of the state and provides a hueristic value for it
// ====================================================================================================== //
// =========================== Heuristic Functions and State============================================= //
// ====================================================================================================== //
function State(tempMatrix, listOfNextPieces, activePiece, holdPiece, score, path, didLose)
{
  // the matrix that is our current state and will be evaluated
  // this is also going to be used to pass into the next state so we can build off of that
  this.matrix = tempMatrix;

  // makes a list of the current available pieces to be passed into the heuristic functions
  // currently doing first 3 states since there are so many permutations
  this.listOfNextPieces = listOfNextPieces;
  this.activePiece = activePiece;
  this.holdPiece = holdPiece;

  // current score of the game
  this.score = score;

  // the path that got us to this state
  this.path = path;

  // current x and y coordinates
  this.x = 3;
  this.y = -2;

  // if we lose going to this state
  this.loseState = didLose;

  // heuristic parameters to help evaluate the value
  this.maxHeight = Array(COLUMN).fill(0); // becomes a single value later
  this.colSum = Array(COLUMN).fill(0);

  // these will get updated in the heuristic call
  this.std_height = 0;
  this.numGaps = 0;
  this.scoreIncrease = 0;           // <=================================================================== TEMP 0 NEED TO FIX!!!
  // the best heuristic value we can get
  this.value = this.heuristic();
}

State.prototype.heuristic = function()
{
  this.updateHeights();

  this.maxHeight = Math.max(...this.maxHeight);
  this.updateStdHeight();
  this.updateNumGaps();

  var si = 0;
  if (this.scoreIncrease >= 40)
  {
    si = 500;
  }
  else
  {
    si = 1;
  }
  // console.log("scoreIncrease: " + scoreIncrease.toString());
  var heur = -(this.numGaps * 100) - (this.maxHeight / 2) - (this.std_height * 10) + (this.scoreIncrease * si);

  // we want to lower the value of the state if we go to a losing one
  if(this.loseState)
  {
    heur -= 9999999999;
  }
  // console.log(heur);
  return heur;
}

// gets the sum of all the col and max heigh of the state
State.prototype.updateHeights = function()
{
  for(let i = 0; i < ROW; ++i)
  {
    for(let j = 0; j < COLUMN; ++j)
    {
      this.colSum[j] += this.matrix[i][j];
      if(this.maxHeight[j] == 0 && this.matrix[i][j] == 1)
      {
        this.maxHeight[j] = ROW - i;
      }
    }
  }
}

// gets the total number of gaps from the first occurence of a piece to the bottom
State.prototype.updateNumGaps = function()
{
  for(let i = 0; i < COLUMN; ++i)
  {
    this.numGaps += this.maxHeight[i] - this.colSum[i];
  }
}

// finds the standard deviation of the state height
State.prototype.updateStdHeight = function()
{
  let average = this.colSum.reduce((a, b) => a + b, 0) / COLUMN;
  for(let i = 0; i < COLUMN; ++i)
  {
    this.std_height += Math.pow(this.colSum[i] - average, 2);
  }

  this.std_height /= COLUMN;
}

State.prototype.duplicateState = function () {
  return new State(this.matrix, this.listOfNextPieces, this.activePiece, this.holdPiece, this.score, this.path, this.didLose);
};
