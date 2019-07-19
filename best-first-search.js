// // the current tetris piece in use
// var game = new Game();
// // draws the board and the boarder around it
// game.drawBoard();
// game.drawBoarder();
// // creates the starting pieces for the game
// game.generateStartingPieces();
// // gets the first piece of the game
// game.getNextPiece();
// // so the first piece has a ghost piece before any input is received
// game.ghostDrop();
//
// // starts the dropping sequence
// drop();

// the heuristic class we are going to use to evaluate the state of the game
function BestFirstSearch()
{
  this.score = 0
  // the best path that the ai can currently go to
  this.path = "";
  // the matrix that will represent the current stte of the board
  // creates a 2d array of row and colum of 0s
  this.matrix = Array(ROW).fill().map(() => Array(COLUMN).fill(0));

  // this info will be passed into state letting it know that this is a losing state
  this.gameDone = false;

  // the current x/y value of the search
  this.x = 3;
  this.y = 0;
}

// the main function of the AI that will loop until the game is over
BestFirstSearch.prototype.startAI = function()
{
  while(!this.gameDone && !game.gameOver)
  // while(this.score <= 100)
  {
    // makes a list of the current available pieces to be passed into the heuristic functions
    // currently doing first 3 states since there are so many permutations
    var tempArray = game.listOfNextPieces.slice();
    tempArray.unshift(new Piece(game.activePiece.tetromino, game.activePiece.color));

    this.score = game.score;
    // will iterate through all the game pieces
    for(let i = 0; i < tempArray.length && !this.gameDone && !game.gameOver; ++i)
    {
      // alert("piece: " + i.toString());
      // console.log('this.matrix before calls');
      // for(g = 0; g<this.matrix.length; ++g)
      // {
      //   console.log(this.matrix[g]);
      // }
      // will iterate through all the different rotations
      let bestState = null;

      // checks this particular tetromino rotation
      for(let j = 0; j < tempArray[i].tetromino.length && !this.gameDone && !game.gameOver; ++j)
      {
        // alert("rotation: " + j.toString());
        // moves the piece as far left as possible so that we can linearly search each state from left to right
        this.moveFarLeft(tempArray[i].tetromino[j]);

        // console.log('tetromino');
        // for(g = 0; g<tempArray[i].tetromino[j].length; ++g)
        // {
        //   console.log(tempArray[i].tetromino[j][g]);
        // }

        // checks this particular rotation of the tetromino
        var width = this.getActualWidth(tempArray[i].tetromino[j])
        for(let k = 0;this.x <= COLUMN - width; ++this.x)
        {
          // finds the lowest point where the piece on go in the matrix
          this.hardDrop(tempArray[i].tetromino[j]);

          let tempScore = this.score;
          // locks the piece into a temporary matrix that will get returned and
          // then heuristically evaluated
          // needs to use the copy function that i found online inorder to make a deep copy manually
          let tempMatrix = this.tempLock(tempArray[i].tetromino[j], copy(this.matrix));

          // to pass that the game is over with this state
          if(this.gameDone)
          {
            var tempState = new State(tempMatrix, j, this.x, this.score - tempScore, true);
            this.gameDone = false;
          }
          else {
            var tempState = new State(tempMatrix, j, this.x, this.score - tempScore, false);
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
              delete tempState;
          }
          this.score = tempScore;
          this.y = 0;
        }

        // resets the coordinates for the next piece rotation
        this.y = 0;
        this.x = 3;

      }

      this.matrix = bestState.matrix;

      this.updatePath(bestState);

      delete bestState;

      // console.log(this.path);
    }
    this.movePiece();

  }
}

BestFirstSearch.prototype.moveFarLeft = function(tetromino)
{
  while(!this.collision(-1, 0, tetromino))
  {
    this.x--;
  }
}

// hard drops the piece to the lowest row it can go and locks it in place
BestFirstSearch.prototype.hardDrop = function(tetromino)
{
  while(!this.collision(0, 1, tetromino))
  {
    this.y++;
  }
}

BestFirstSearch.prototype.collision = function(offsetX, offsetY, pieceType)
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

BestFirstSearch.prototype.tempLock = function(tetromino, cur_matrix)
{
    for(let i = 0; i < tetromino.length; ++i)
    {
       for(let j = 0; j < tetromino.length && !this.gameDone; ++j)
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
               // alert("BFS Game Over");
               this.gameDone = true;
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

BestFirstSearch.prototype.updatePath = function(curState)
{
  // for which rotation we are using
  this.path += "C".repeat(curState.tetrominoN);

  // determines which way the piece will move
  let dirNum = curState.x - 3;
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

// moves the current piece based on the path instructions
BestFirstSearch.prototype.movePiece = function()
{
  // this will moves the pieces based on the path inputs that the heuristic generated
  console.log("======= entering function movePiece =======");
  console.log(this.path);
  for(let i = 0; i < this.path.length; ++i)
  {
    if(this.path[i] == "L")
    {
      // console.log("MOVING LEFT");
      game.moveLeft();
    }
    else if (this.path[i] == "R")
    {
      // console.log("MOVING RIGHT");
      game.moveRight();
    }
    else if (this.path[i] == "C")
    {
      // console.log("ROTATING");
      game.rotate();
    }
    else if (this.path[i] == "D")
    {
      // console.log("HARD DROP");
      game.hardDrop();
    }
  }
  this.path = "";
  console.log("======= leaving function movePiece =======");
}
BestFirstSearch.prototype.getActualWidth = function (tetro)
{
  var width = Array(tetro.length).fill(0);

  for(let i = 0; i < tetro.length; ++i)
  {
    for(let j = 0; j < tetro.length; ++j)
    {
      width[j] += tetro[i][j];
    }
  }

  var start = -1;
  var end = -1;
  for(var i = 0; i < width.length; ++i)
  {
    if(width[i] >= 1 && start == -1)
    {
      start = i;
    }
    if(start != -1 && end == -1)
    {
      end = start;
    }
    else if(width[i] > 0 && end != -1)
    {
      ++end;
    }
  }
  return end - start + 1;
};

function copy(o) {
   var output, v, key;
   output = Array.isArray(o) ? [] : {};
   for (key in o) {
       v = o[key];
       output[key] = (typeof v === "object") ? copy(v) : v;
   }
   return output;
}

function sleep(ms)
{
  console.log("SLEEP");
  var date = new Date();
  var curDate = null;
  do
  {
    curDate = new Date();
  } while (curDate - date < ms);
}
// this class is similar to the Game class but it is going to have less member vairables
// which will hopefully increase the speed and reduce memory
function State(matrix, tetrominoN, curX, scoreIncrease, didLose)
{
  // the matrix that is our current state and will be evaluated
  // this is also going to be used to pass into the next state so we can build off of that
  this.matrix = matrix;
  this.scoreIncrease = scoreIncrease;
  // this will let us know which rotation to use for the tetromino piece
  this.tetrominoN = tetrominoN;
  // the x value will determine if we move left and right and by how much
  this.x = curX;
  this.loseState = didLose;

  // heuristic parameters to help evaluate the value
  this.maxHeight = Array(COLUMN).fill(0);
  this.colSum = Array(COLUMN).fill(0);
  // the best heuristic value we can get
  this.value = this.heuristic();
}

// evaluatse the value of the state and provides a hueristic value for it
State.prototype.heuristic = function()
{
  this.getHeight();

  var numGaps = this.getNumGaps();
  var maxHeight = Math.max(...this.maxHeight);
  var std_height = this.getStdHeight();

  var scoreIncrease = this.scoreIncrease;

  var si = 0;
  if (scoreIncrease >= 40)
  {
    si = 500;
  }
  else
  {
    si = 1;
  }
  if (numGaps > 0 && scoreIncrease >= 10)
  {
    si *= 10 * numGaps;
  }
  if (maxHeight > 5 && scoreIncrease >= 10)
  {
    si *= maxHeight;
  }


  let heur = -(numGaps * 50) - (maxHeight / 2) - (std_height * 4) + (scoreIncrease * si);
  // if(this.loseState)
  // {
  //   alert(loseState);
  //   heur -= 10000;
  // }
  // console.log(heur);
  return heur;
}

// gets the sum of all the col and max heigh of the state
State.prototype.getHeight = function()
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
State.prototype.getNumGaps = function()
{
  let gaps = 0;
  for(let i = 0; i < COLUMN; ++i)
  {
    gaps += this.maxHeight[i] - this.colSum[i];
  }
  return gaps;
}

// finds the standard deviation of the state height
State.prototype.getStdHeight = function()
{
  let standardDev = 0;
  let average = this.colSum.reduce((a, b) => a + b, 0) / COLUMN;
  for(let i = 0; i < COLUMN; ++i)
  {
    standardDev += Math.pow(this.colSum[i] - average, 2);
  }

  return standardDev / COLUMN;
}
