// // the current tetris piece in use
var game = new Game();
// draws the board and the boarder around it
game.drawBoard();
game.drawBoarder();
// creates the starting pieces for the game
game.generateStartingPieces();
// gets the first piece of the game
game.getNextPiece();
// so the first piece has a ghost piece before any input is received
game.ghostDrop();

// starts the dropping sequence
drop();

// the heuristic class we are going to use to evaluate the state of the game
function BestFirstSearch()
{
  this.score = 0
  // the best path that the ai can currently go to
  this.path = "";
  this.h_n = -999999; // to represent a really small heuristic value
  // the matrix that will represent the current stte of the board
  // creates a 2d array of row and colum of 0s
  this.matrix = Array(ROW).fill().map(() => Array(COLUMN).fill(0));

  this.gameDone = false;

  // the current x/y value of the search
  this.x = 3;
  this.y = 0;
}

// the main function of the AI that will loop until the game is over
BestFirstSearch.prototype.startAI = function()
{
  while(!this.gameDone)
  {
    // makes a list of the current available pieces to be passed into the heuristic functions
    // currently doing first 3 states since there are so many permutations
    var tempArray = game.listOfNextPieces.slice(0,2);
    tempArray.unshift(new Piece(game.activePiece.tetromino, game.activePiece.color));

    // to see the pieces
    // for(z = 0; z <tempArray.length; ++z){
    //   console.log(tempArray[z]);
    // }

    // will iterate through the first 3 game pieces
    for(let i = 0; i < 3; ++i)
    {
      alert("piece: " + i.toString());
      console.log('this.matrix before calls');
      for(g = 0; g<this.matrix.length; ++g)
      {
        console.log(this.matrix[g]);
      }
      // will iterate through all the different rotations
      let max = -999999
      // checks this particular tetromino rotation
      for(let j = 0; j < tempArray[i].tetromino.length; ++j)
      {
        // alert("rotation: " + j.toString());
        // moves the piece as far left as possible so that we can linearly search each state from left to right
        this.moveFarLeft(tempArray[i].tetromino[0]);

        // checks this particular rotation of the tetromino
        // we need to find the actual length that the piece occupies and not the length of the array <------------FIX THIS------------------------FIX THIS
        for(let k = 0;this.x <= COLUMN - tempArray[i].tetromino[j].length; ++this.x)
        {
          // finds the lowest point where the piece on go in the matrix
          this.hardDrop(tempArray[i].tetromino[j]);
          // locks the piece into a temporary matrix that will get returned and
          // then heuristically evaluated
          // needs to use the copy function that i found online inorder to make a deep copy manually
          let tempMatrix = this.tempLock(tempArray[i].tetromino[j], copy(this.matrix));
          let tempState = new State(tempMatrix, tetrominoN, curX)

          this.y = 0;
        }

        // resets the coordinates for the next piece
        this.y = 0;
        this.x = 3;

      }

      this.path += "D";
      console.log(this.path);
    }

    this.gameDone = true;
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
  console.log("BEST first search collision");
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
               alert("BFS Game Over");

               // stop request animation frame
               this.gameDone = true;
               return;
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
// moves the piece left if there is no collision
Game.prototype.moveLeft = function()
{
  if(!this.collision(-1, 0, this.activePiece.activeTetromino))
  {
    this.unDraw();
    this.x--;
    this.draw();
    // resets the lock time
    this.lockTime = Date.now();

    // drops ghost piece
    this.ghostDrop(true);
  }
}

// moves the piece right if there is no collision
Game.prototype.moveRight = function()
{
  console.log("right");
  if(!this.collision(1, 0, this.activePiece.activeTetromino))
  {
    this.unDraw();
    this.x++;
    this.draw();
    // resets the lock time
    this.lockTime = Date.now();

    // drops ghost piece
    this.ghostDrop(true);
  }
}

// only have the ability to rotate clockwise
Game.prototype.rotate = function()
{
  if(!this.collision(0, 0, this.activePiece.tetromino[(this.activePiece.tetrominoN + 1) % 4]))
  {
    this.unDraw();
    this.activePiece.tetrominoN = (++this.activePiece.tetrominoN) % 4;
    this.activePiece.activeTetromino = this.activePiece.tetromino[this.activePiece.tetrominoN];
    this.draw();
    // resets the lock time
    this.lockTime = Date.now();

    // drops ghost piece
    this.unDraw("ghost");
    this.ghostPiece.tetrominoN = (++this.ghostPiece.tetrominoN) % 4;
    this.ghostPiece.activeTetromino = this.ghostPiece.tetromino[this.ghostPiece.tetrominoN];

    this.ghostDrop(false);
  }
  // try new location with the shift amount from the previous function call
  else if(!this.collision(this.shiftAmount, 0, this.activePiece.tetromino[(this.activePiece.tetrominoN + 1) % 4]))
  {
    this.unDraw();
    this.x += this.shiftAmount;
    this.activePiece.activeTetromino = this.activePiece.tetromino[(++this.activePiece.tetrominoN) % 4];
    this.draw();
    // resets the lock time
    this.lockTime = Date.now();

    // drops ghost piece
    this.unDraw("ghost");
    this.ghostPiece.tetrominoN = (++this.ghostPiece.tetrominoN) % 4
    this.ghostPiece.activeTetromino = this.ghostPiece.tetromino[this.ghostPiece.tetrominoN];

    this.ghostDrop(false);
  }
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
      console.log("MOVING LEFT");
      game.moveLeft();
    }
    else if (this.path[i] == "R")
    {
      console.log("MOVING RIGHT");
      game.moveRight();
    }
    else if (this.path[i] == "D")
    {
      console.log("HARD DROP");
      game.hardDrop();
    }
  }

  console.log("======= leaving function movePiece =======");
}

function copy(o) {
   var output, v, key;
   output = Array.isArray(o) ? [] : {};
   for (key in o) {
       v = o[key];
       output[key] = (typeof v === "object") ? copy(v) : v;
   }
   return output;
}

// this class is similar to the Game class but it is going to have less member vairables
// which will hopefully increase the speed and reduce memory
function State(matrix, tetrominoN, curX)
{
  // the matrix that is our current state and will be evaluated
  // this is also going to be used to pass into the next state so we can build off of that
  this.matrix = matrix;
  // the best heuristic value we can get
  this.value = -999999;

  // this will let us know which rotation to use for the tetromino piece
  this.tetrominoN = tetrominoN;
  // the x value will determine if we move left and right and by how much
  this.x = 0;
}

var best = new BestFirstSearch();
best.startAI();
best.movePiece();
