// The size of the convas that the tetris game is going to be played on
const ROW = 20;
const COLUMN = 10;
const SQ = 50;

// The colors of the board and what they should be
const EMPTY = "WHITE";

// all the different pieces and associates them to a color
const PIECES = [
    [Z, "RED"],
    [S, "GREEN"],
    [T, "PURPLE"],
    [O, "YELLOW"],
    [L, "ORANGE"],
    [I, "CYAN"],
    [J, "BLUE"]
];

// this class holds the board and all the pieces so that the AI can see things easier
function Game()
{
  // the canvas that is going to be drawn on the html canvas
  this.canvas = document.getElementById("tetrisBoard");
  this.context = this.canvas.getContext("2d");
  this.holdPNG = document.getElementById("holdPiece");
  this.scoreElement = document.getElementById("score");
  this.score = 0;

  // the board will also help us determine where pieces are already locked in place
  // so we don't move into them or outside the board
  this.board = Array(ROW).fill().map(() => Array(COLUMN).fill(EMPTY));

  // the starting place of the tetris pieces
  // these variables will hold the current coordinates of the tetromino
  this.x = 3;
  this.y = -2;

  // the coordinates for the ghost piece
  this.ghostX = 3;
  this.ghostY = -2;

  // this will be the list of pieces that are next in queue
  this.listOfNextPieces = [];

  // the time since the last drop
  this.dropTime = Date.now();
  // for determining if the game is over or not
  this.gameOver = false;
  // time since last move so if the user doesn't move the piece in X time it will lock in place
  this.lockTime = Date.now();

  // the differenet drop speeds through out the game
  this.dropSpeed = 1000;

  // shift aount for trying new rotation
  this.shiftAmount = 0;

  // pointer to the hold piece
  this.holdPiece = 0;
  // pointer to the active piece
  this.activePiece;

  // pointer to the ghost piece
  this.ghostPiece;

  // a flag for determining if this piece was swapped
  this.swapped = false;
}

// draws a boarder around the canvas
Game.prototype.drawBoarder = function()
{
  this.context.beginPath();
  this.context.lineWidth = 2;
  this.context.strokeStyle = "black";

  // top boarder
  this.context.moveTo(0, 0);
  this.context.lineTo(500, 0);

  // right boarder
  this.context.moveTo(500, 0);
  this.context.lineTo(500, 1000);

  // bottom boarder
  this.context.moveTo(500, 1000);
  this.context.lineTo(0, 1000);

  // left boarder
  this.context.moveTo(0, 1000);
  this.context.lineTo(0, 0);
  this.context.stroke();

}

// draws a square
 Game.prototype.drawSquare = function(x, y, color)
{
    this.context.lineWidth = 2;
    this.context.fillStyle = color;
    this.context.fillRect(x*SQ,y*SQ,SQ,SQ);

    this.context.strokeStyle = "BLACK";
    this.context.strokeRect(x*SQ,y*SQ,SQ,SQ);
}

// draws the board
Game.prototype.drawBoard = function()
{
  for(let i = 0; i < ROW; ++i)
  {
    for(let j = 0; j < COLUMN; ++j)
    {
        this.drawSquare(j,i,this.board[i][j]);
    }
  }
}

// generates one of each piece in a random order
Game.prototype.generateStartingPieces = function()
{
  var nums = [0, 1, 2, 3, 4, 5, 6];

  // loops 7 - 1
  for(let i = nums.length - 1; i >= 0; --i)
  {
    let j = 0;
    // random index from 0 - 6 initially, then decrements from there
    j = Math.floor(randomSeeded.nextFloat() * (i + 1));
    this.listOfNextPieces.push(new Piece(PIECES[nums[j]][0], PIECES[nums[j]][1]));

    // removes the jth item from the list
    nums.splice(j, 1);
  }
}

// fills the board based on the 2d array of the Piece
// input:
//  1) takes the Piece object to be filled
Game.prototype.fill = function(color, ghost)
{
    if(ghost === "ghost")
    {
      // console.log(this.ghostPiece.color);
      var tetro = this.ghostPiece;
      var indexX = this.ghostX;
      var indexY = this.ghostY;
    }
    else
    {
      var tetro = this.activePiece;
      var indexX = this.x;
      var indexY = this.y;
    }

    for(let i = 0; i < tetro.activeTetromino.length; ++i)
    {
        for(let j = 0; j < tetro.activeTetromino.length; ++j)
        {
            // we draw only occupied squares
            if(tetro.activeTetromino[i][j])
            {
                this.drawSquare(indexX + j,indexY + i, color);
            }
        }
    }
}

// draws the piece with its current values
Game.prototype.draw = function(ghost)
{
  if(ghost === "ghost")
  {
    // console.log("before draw ghost");
    this.fill(this.ghostPiece.color, "ghost");
    // console.log("after draw ghost");
  }
  else
  {
    this.fill(this.activePiece.color);
  }
}

// removes the piece from the canvas with it current cordinates
Game.prototype.unDraw = function(ghost)
{
  if(ghost === "ghost")
  {
    // console.log("before undraw ghost");
    this.fill(EMPTY, "ghost");
    // console.log("after undraw ghost");
  }
  else
  {
    this.fill(EMPTY);
  }
}

// this function helps us determine if the tetromino collides with the walls or
// other pieces
Game.prototype.collision = function(offsetX, offsetY, pieceType, ghost)
{
  // console.log("collision");
  if(ghost === "ghost")
  {
    var indexX = this.ghostX;
    var indexY = this.ghostY;
  }
  else
  {
    var indexX = this.x;
    var indexY = this.y;
  }
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
      let newX = indexX + j + offsetX;
      let newY = indexY + i + offsetY;

      // checks if it will collide with the wall
      if(newX >= COLUMN || newX < 0 || newY >= ROW)
      {
        this.activePiece.calcShiftAmount(newX, this.x, pieceType);
        return true;
      }

      // don't want to index negatively into an array
      // use case: when the piece first spawns it is outside of the canvas
      if(newY < 0)
      {
        continue;
      }

      // checks if there new new spot is not empty
      if(this.board[newY][newX] != EMPTY)
      {
        this.activePiece.calcShiftAmount(newX, this.x, pieceType);
        return true;
      }
    }
  }
  // there was no collision
  return false;
}

// moves the piece down if there is no collision
// locks the piece if the last unsuccessful move was longer than (0.5seconds)
Game.prototype.moveDown = function()
{
  if(!this.collision(0, 1, this.activePiece.activeTetromino) && !this.gameOver)
  {
    this.unDraw();
    this.y++;
    this.draw();
    // resets the lock time
    this.lockTime = Date.now();
  }
  else if(!this.gameOver)
  {
    // this means it collided with something trying to move move down
    // if the lock time is longer than 0.5s then the piece gets locked
    if((Date.now() - this.lockTime) >= 500)
    {
      // locks the color and the cells into the board
      this.lock();
    }
  }
}

// moves the piece left if there is no collision
Game.prototype.moveLeft = function()
{
  if(!this.collision(-1, 0, this.activePiece.activeTetromino) && !this.gameOver)
  {
    // sleep(1000);
    this.unDraw();
    // sleep(2000);

    this.x--;
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
  if(!this.collision(0, 0, this.activePiece.tetromino[(this.activePiece.tetrominoN + 1) % 4]) && !this.gameOver)
  {
    // sleep(1000);
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
  else if(!this.collision(this.shiftAmount, 0, this.activePiece.tetromino[(this.activePiece.tetrominoN + 1) % 4]) && !this.gameOver)
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

// only have the ability to rotate clockwise
Game.prototype.counterRotate = function()
{
  if(!this.collision(0, 0, this.activePiece.tetromino[(this.activePiece.tetrominoN + 3) % 4]) && !this.gameOver)
  {
    // sleep(1000);
    this.unDraw();
    this.activePiece.tetrominoN = (this.activePiece.tetrominoN + 3) % 4;
    this.activePiece.activeTetromino = this.activePiece.tetromino[this.activePiece.tetrominoN];
    this.draw();
    // resets the lock time
    this.lockTime = Date.now();

    // drops ghost piece
    this.unDraw("ghost");
    this.ghostPiece.tetrominoN = (this.ghostPiece.tetrominoN + 3) % 4;
    this.ghostPiece.activeTetromino = this.ghostPiece.tetromino[this.ghostPiece.tetrominoN];

    this.ghostDrop(false);
  }
  // try new location with the shift amount from the previous function call
  else if(!this.collision(this.shiftAmount, 0, this.activePiece.tetromino[(this.activePiece.tetrominoN + 3) % 4]) && !this.gameOver)
  {
    this.unDraw();
    this.x += this.shiftAmount;
    this.activePiece.tetrominoN = (this.activePiece.tetrominoN + 3) % 4;
    this.activePiece.activeTetromino = this.activePiece.tetromino[this.activePiece.tetrominoN];
    this.draw();
    // resets the lock time
    this.lockTime = Date.now();

    // drops ghost piece
    this.unDraw("ghost");
    this.ghostPiece.tetrominoN = (this.ghostPiece.tetrominoN + 3) % 4;
    this.ghostPiece.activeTetromino = this.ghostPiece.tetromino[this.ghostPiece.tetrominoN];

    this.ghostDrop(false);
  }
}

// moves the piece right if there is no collision
Game.prototype.moveRight = function()
{
  if(!this.collision(1, 0, this.activePiece.activeTetromino) && !this.gameOver)
  {
    // sleep(1000);
    this.unDraw();
    this.x++;
    this.draw();
    // resets the lock time
    this.lockTime = Date.now();

    // drops ghost piece
    this.ghostDrop(true);
  }
}

// hard drops the piece to the lowest row it can go and locks it in place
Game.prototype.hardDrop = function()
{
  while(!this.collision(0, 1, this.activePiece.activeTetromino) && !this.gameOver)
  {
    this.y++;
  }
  if(!this.gameOver)
  {
    this.unDraw("ghost");

    this.unDraw();
    this.draw();
    this.lock();
  }
}

// drops ghost piece
Game.prototype.ghostDrop = function(isUndraw)
{
  if(isUndraw)
  {
    this.unDraw("ghost");
  }

  this.ghostX = this.x;
  this.ghostY = this.y;

  while(!this.collision(0, 1, this.ghostPiece.activeTetromino, "ghost"))
  {
    this.ghostY++;
  }

  this.draw("ghost");
}

// locks the piece to the board, clears rows and calculates the score and speed of the game
Game.prototype.lock = function()
{
  this.ghostX = 3;
  this.ghostY = -2;

  for(let i = 0; i < this.activePiece.activeTetromino.length; ++i)
  {
     for(let j = 0; j < this.activePiece.activeTetromino.length && !this.gameOver; ++j)
     {
         // ingore the empty/0 indexes
         if( !this.activePiece.activeTetromino[i][j])
         {
             continue;
         }

         // game is over if the piece is locked over the board
         // might change this later so that you lose if the whole piece gets locked above the screen
         if(this.y + i < 0)
         {
              console.log("GAME OVER");
              console.log(this.activePiece.activeTetromino);
             console.log(this.x);
             console.log(this.y);
             for(k = 0; k < this.activePiece.activeTetromino.length; ++k)
             {
               console.log(this.activePiece.activeTetromino[k]);
             }

             this.gameOver = true;
             return;
         }

         // we lock the piece
        this.board[this.y + i][this.x + j] = this.activePiece.color;
     }
   }

   // removes full rows
   for(let i = 0; i < ROW; ++i)
   {
     let isRowFull = true;
     for(let j = 0; j < COLUMN; ++j)
     {
         isRowFull = isRowFull && (this.board[i][j] != EMPTY);

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
                 this.board[y][j] = this.board[y - 1][j];
             }
         }

         // since we deleted a row there is no row above it
         // this might also change if the definition of game over changes
         for(let j = 0; j < COLUMN; ++j)
         {
             this.board[0][j] = EMPTY;
         }
         // increment the score
         this.score += 10;

         if(this.score % 50 == 0)
         {
           this.dropSpeed *= 0.90;
         }
         // console.log(this.dropSpeed);
     }
 }

 // updates the board
 this.drawBoard();

 // console.log(board);
 // console.log(score);

 // updates the score
 this.scoreElement.innerHTML = this.score;

 // gets the next piece to be dropped
 delete this.activePiece;
 delete this.ghostPiece;
 this.getNextPiece();

 // resets to the default starting location of the next piece
 this.x = 3;
 this.y = -2;

 this.ghostDrop(true);

 // restarts if a piece was swapped
 this.swapped = false;
}

Game.prototype.getNextPiece = function()
{
  // remove the first element of the array and returns it to be stored in piece
  this.activePiece = this.listOfNextPieces.shift();

  this.ghostPiece = new Piece(this.activePiece.tetromino, this.getGhostColor(this.activePiece.color)); // <---------------------------------------------------------------------!!!!! FIX COPYING OF OBJ !!!!!

  // generates a random number 0 - 6
  randomNum = Math.floor(randomSeeded.nextFloat() * PIECES.length)
  // adds a piece to replace the one that was taken
  this.listOfNextPieces.push(new Piece(PIECES[randomNum][0], PIECES[randomNum][1]));
  // console.log(listOfNextPieces);

  this.updateNextPiecesPNG();
}

Game.prototype.getGhostColor = function(mainColor)
{
  if(mainColor == "RED")
  {
    return "LIGHTCORAL";
  }
  else if (mainColor == "GREEN")
  {
    return "LIGHTGREEN";
  }
  else if (this.activePiece.color == "PURPLE")
  {
    return "MEDIUMPURPLE";
  }
  else if (this.activePiece.color == "YELLOW")
  {
    return "KHAKI";
  }
  else if (this.activePiece.color == "ORANGE")
  {
    return "KHAKI";
  }
  else if (this.activePiece.color == "CYAN")
  {
    return "PALETURQUOISE";
  }
  else if (this.activePiece.color == "BLUE")
  {
    return "ROYALBLUE";
  }
}

Game.prototype.updateNextPiecesPNG = function()
{
  for(let i = 0; i < this.listOfNextPieces.length; ++i)
  {
    let tempID = document.getElementById("nextPiece" + i);
    this.updatePNG(tempID, this.listOfNextPieces[i].color);
  }
}

// swaps out the current piece for another piece
Game.prototype.hold = function()
{
  // have this in case a piece has never been swapped and this.holdPiece is null (i.e. this case 0)
  if(this.holdPiece === 0)
  {
    // removes the ghost pieces and updates it with the hold piece
    // needs to be called before getNextPiece cause the call will get a new ghost piece and will
    // disturb the deletion process
    this.unDraw("ghost");
    // deletes the object and frees up memory
    delete this.ghostPiece;

    this.unDraw();
    // swaps out the current piece and grabs a new piece
    this.swapped = true;
    this.holdPiece = this.activePiece;
    this.getNextPiece();

    // resets to the default starting location of the swapped piece
    this.x = 3;
    this.y = -2;

    this.draw();

    this.updatePNG(this.holdPNG, this.holdPiece.color);

    // drops the ghost piece and prevents it from next piece dropping too far and being written into the other pieces
    this.ghostDrop(false);
  }
  // can only swap once before
  else if(!this.swapped)
  {
    // removes the ghost pieces and updates it with the hold piece
    // needs to be called before getNextPiece cause the call will get a new ghost piece and will
    // disturb the deletion process
    this.unDraw("ghost");
    // deletes the object and frees up memory
    delete this.ghostPiece;

    this.unDraw();
    // resets the terominoN and tetromino as well as swapping the pieces
    this.swapped = true;
    let temp = this.holdPiece;
    this.holdPiece = this.activePiece;
    this.activePiece = temp;

    this.activePiece.tetrominoN = 0;
    this.activePiece.activeTetromino = this.activePiece.tetromino[this.activePiece.tetrominoN];
    // resets to the default starting location of the swapped piece
    this.x = 3;
    this.y = -2;

    this.draw();

    this.updatePNG(this.holdPNG, this.holdPiece.color);

    // creates the new ghost pieces and drops it
    this.ghostPiece = new Piece(this.activePiece.tetromino, this.getGhostColor(this.activePiece.color));
    this.ghostDrop(false);
  }
}

Game.prototype.updatePNG = function (place, color)
{
  place.src = "assets/tetrominos_img/" + color + ".png";
}

// not sure if i need/should put each class in its own file?
// ====- GAME CLASS END ================================================

// input:
//  tetromino = the type of tetris piece that is going to be generated
//  color = the color of the piece
function Piece(tetromino, color)
{
    // the type of piece and it associated color (list of possible rotations)
    this.tetromino = tetromino;
    // the color of the piece
    this.color = color;

    // the default patter of every piece
    this.tetrominoN = 0;
    // the currently active pattern
    this.activeTetromino = this.tetromino[this.tetrominoN];
}

// listens for keyboard input and based on the inputs code it does moves the piece
// accordingly
document.addEventListener("keydown", CONTROL);

function CONTROL(event)
{
    // to get the keycodes of keys go to, https://keycode.info
    // if the left button was pressed
    if(event.keyCode == 37)
    {
        game.moveLeft();
    }
    // c
    else if(event.keyCode == 67)
    {
        // piece.rotate();
        game.hold();
    }
    // x
    else if(event.keyCode == 88)
    {
        game.counterRotate();
    }
    // right
    else if(event.keyCode == 39)
    {
        game.moveRight();
    }
    // down
    else if(event.keyCode == 40)
    {
        game.moveDown();
    }
    else if(event.keyCode == 38)
    {
        game.hardDrop();
    }
}

// calculates how much a piece needs to shift to possibly rotate
Piece.prototype.calcShiftAmount = function(newX, originalX, pieceType)
{
  // collision on the right
  if(newX - originalX > 0)
  {
    shiftAmount = -1;
    if(this.color == "CYAN" && (this.tetrominoN == 3))
    {
      shiftAmount = -2;
    }
  }
  else if((newX - originalX < 0) || (newX - Math.abs(originalX) < 0))
  {
    shiftAmount = 1;
    if(this.color == "CYAN" && (this.tetrominoN == 1))
    {
      shiftAmount = 2;
    }
  }
}

// drops the current piece at the current speed of the game
function drop()
{
  let currentTime = Date.now();

  // drops the piece if enough time has elapsed
  if((currentTime - game.dropTime) > game.dropSpeed)
  {
    game.moveDown();
    game.dropTime = Date.now();
  }
  // when the browser has time it will call this function again
  if(!game.gameOver)
  {
     requestAnimationFrame(drop);
  }
  else
  {
    delete game;
    delete best;
    console.log("DELETE GAME AND THEN BEST.GAME");
    alert("Game Over from tetris.js");
  }
}

function displaySettings()
{
  alert("Change Settings Button!");
}

// got this code from https://gist.github.com/blixt/f17b47c62508be59987b
function Random(seed) {
  this._seed = seed % 2147483647;
  if (this._seed <= 0) this._seed += 2147483646;
}

/**
 * Returns a pseudo-random value between 1 and 2^32 - 2.
 */
Random.prototype.next = function () {
  return this._seed = this._seed * 16807 % 2147483647;
};


/**
 * Returns a pseudo-random floating point number in range [0, 1).
 */
Random.prototype.nextFloat = function (opt_minOrMax, opt_max) {
  // We know that result of next() will be 1 to 2147483646 (inclusive).
  return (this.next() - 1) / 2147483646;
};

// the current tetris piece in use
var randomSeeded = new Random(1);
var game = new Game();
// draws the board and the boarder around it
game.drawBoard();
game.drawBoarder();
// creates the starting pieces for the game
game.generateStartingPieces();
// gets the first piece of the game
game.getNextPiece();

// this will be called from the button press from index
function StartGame()
{
  // so the first piece has a ghost piece before any input is received
  game.ghostDrop();
  // starts the dropping sequence
  drop();
}
