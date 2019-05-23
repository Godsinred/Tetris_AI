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
  this.context = canvas.getContext("2d");
  this.scoreElement = document.getElementById("score");
  this.score = 0;

  // the board will also help us determine where pieces are already locked in place
  // so we don't move into them or outside the board
  this.board = [];
  for(i = 0; i < ROW; ++i)
  {
      this.board[i] = [];
      for(j = 0; j < COLUMN; ++j)
      {
          this.board[i][j] = EMPTY;
      }
  }

  // the starting place of the tetris pieces
  // these variables will hold the current coordinates of the tetromino
  this.x = 3;
  this.y = -2;

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
    j = Math.floor(Math.random() * (i + 1));
    this.listOfNextPieces.push(new Piece(PIECES[nums[j]][0], PIECES[nums[j]][1]));

    // removes the jth item from the list
    nums.splice(j, 1);
  }
}

// fills the board based on the 2d array of the Piece
// input:
//  1) takes the Piece object to be filled
Game.prototype.fill = function(color)
{
    for(let i = 0; i < this.activePiece.activeTetromino.length; ++i)
    {
        for(let j = 0; j < this.activePiece.activeTetromino.length; ++j)
        {
            // we draw only occupied squares
            if(this.activePiece.activeTetromino[i][j])
            {
                this.drawSquare(this.x + j,this.y + i, color);
            }
        }
    }
}

// draws the piece with its current values
Game.prototype.draw = function()
{
  this.fill(this.activePiece.color);
}

// removes the piece from the canvas with it current cordinates
Game.prototype.unDraw = function()
{
  this.fill(EMPTY);
}

// this function helps us determine if the tetromino collides with the walls or
// other pieces
Game.prototype.collision = function(offsetX, offsetY, pieceType)
{
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
        this.calcShiftAmount(newX, this.x, pieceType);
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
        this.calcShiftAmount(newX, this.x, pieceType);
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
  if(!this.collision(0, 1, this.activePiece.activeTetromino))
  {
    this.unDraw();
    this.y++;
    this.draw();
    // resets the lock time
    this.lockTime = Date.now();
  }
  else
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
  if(!this.collision(-1, 0, this.activePiece.activeTetromino))
  {
    this.unDraw();
    this.x--;
    this.draw();
    // resets the lock time
    this.lockTime = Date.now();
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
  }
}

// only have the ability to rotate clockwise
Game.prototype.counterRotate = function()
{
  if(!this.collision(0, 0, this.activePiece.tetromino[(this.activePiece.tetrominoN + 3) % 4]))
  {

    this.unDraw();
    this.activePiece.tetrominoN = (this.activePiece.tetrominoN + 3) % 4;
    this.activePiece.activeTetromino = this.activePiece.tetromino[this.activePiece.tetrominoN];
    this.draw();
    // resets the lock time
    this.lockTime = Date.now();
  }
  // try new location with the shift amount from the previous function call
  else if(!this.collision(this.shiftAmount, 0, this.activePiece.tetromino[(this.activePiece.tetrominoN + 3) % 4]))
  {
    this.unDraw();
    this.x += this.shiftAmount;
    this.activePiece.tetrominoN = (this.activePiece.tetrominoN + 3) % 4;
    this.activePiece.activeTetromino = this.activePiece.tetromino[this.activePiece.tetrominoN];
    this.draw();
    // resets the lock time
    this.lockTime = Date.now();
  }
}

// moves the piece right if there is no collision
Game.prototype.moveRight = function()
{
  if(!this.collision(1, 0, this.activePiece.activeTetromino))
  {
    this.unDraw();
    this.x++;
    this.draw();
    // resets the lock time
    this.lockTime = Date.now();
  }
}

// hard drops the piece to the lowest row it can go and locks it in place
Gamw.prototype.hardDrop = function()
{
  while(!this.collision(0, 1, this.activePiece.activeTetromino))
  {

    this.y++;

  }
  this.unDraw();
  this.draw();
  this.lock()
}

// not sure if i need/should put each class in its own file?
// ====- GAME CLASS END ================================================================================================ CHECK!!

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

    // a flag for determining if this piece was swapped
    this.swapped = false;
}

// fills the board based on the 2d array of the Piece   <------------------------------------------- has been changed to class Game
// Piece.prototype.fill = function(color)
// {
//     for(let i = 0; i < this.activeTetromino.length; ++i)
//     {
//         for(let j = 0; j < this.activeTetromino.length; ++j)
//         {
//             // we draw only occupied squares
//             if(this.activeTetromino[i][j])
//             {
//                 drawSquare(this.x + j,this.y + i, color);
//             }
//         }
//     }
// }
//
// // draws the piece with its current values
// Piece.prototype.draw = function()
// {
//   this.fill(this.color);
// }
//
//
// // removes the piece from the canvas with it current cordinates
// Piece.prototype.unDraw = function()
// {
//   this.fill(EMPTY);
// }
//
// // moves the piece down if there is no collision
// // locks the piece if the last unsuccessful move was longer than (0.5seconds)
// Piece.prototype.moveDown = function()
// {
//   if(!this.collision(0, 1, this.activeTetromino))
//   {
//     this.unDraw();
//     this.y++;
//     this.draw();
//     // resets the lock time
//     lockTime = Date.now();
//   }
//   else
//   {
//     // this means it collided with something trying to move move down
//     // if the lock time is longer than 0.5s then the piece gets locked
//     if((Date.now() - lockTime) >= 500)
//     {
//       // locks the color and the cells into the board
//       this.lock();
//     }
//   }
// }
//
// // moves the piece left if there is no collision
// Piece.prototype.moveLeft = function()
// {
//   if(!this.collision(-1, 0, this.activeTetromino))
//   {
//     this.unDraw();
//     this.x--;
//     this.draw();
//     // resets the lock time
//     lockTime = Date.now();
//   }
// }
//
// // only have the ability to rotate clockwise
// Piece.prototype.rotate = function()
// {
//   if(!this.collision(0, 0, this.tetromino[(this.tetrominoN + 1) % 4]))
//   {
//
//     this.unDraw();
//     this.tetrominoN = (++this.tetrominoN) % 4;
//     this.activeTetromino = this.tetromino[this.tetrominoN];
//     this.draw();
//     // resets the lock time
//     lockTime = Date.now();
//   }
//   // try new location with the shift amount from the previous function call
//   else if(!this.collision(shiftAmount, 0, this.tetromino[(this.tetrominoN + 1) % 4]))
//   {
//     this.unDraw();
//     this.x += shiftAmount;
//     this.activeTetromino = this.tetromino[(++this.tetrominoN) % 4];
//     this.draw();
//     // resets the lock time
//     lockTime = Date.now();
//   }
// }
//
// // only have the ability to rotate clockwise
// Piece.prototype.counterRotate = function()
// {
//   if(!this.collision(0, 0, this.tetromino[(this.tetrominoN + 3) % 4]))
//   {
//
//     this.unDraw();
//     this.tetrominoN = (this.tetrominoN + 3) % 4;
//     this.activeTetromino = this.tetromino[this.tetrominoN];
//     this.draw();
//     // resets the lock time
//     lockTime = Date.now();
//   }
//   // try new location with the shift amount from the previous function call
//   else if(!this.collision(shiftAmount, 0, this.tetromino[(this.tetrominoN + 3) % 4]))
//   {
//     this.unDraw();
//     this.x += shiftAmount;
//     this.tetrominoN = (this.tetrominoN + 3) % 4;
//     this.activeTetromino = this.tetromino[this.tetrominoN];
//     this.draw();
//     // resets the lock time
//     lockTime = Date.now();
//   }
// }
//
// // moves the piece right if there is no collision
// Piece.prototype.moveRight = function()
// {
//   if(!this.collision(1, 0, this.activeTetromino))
//   {
//     this.unDraw();
//     this.x++;
//     this.draw();
//     // resets the lock time
//     lockTime = Date.now();
//   }
// }
//
// // hard drops the piece to the lowest row it can go and locks it in place
// Piece.prototype.hardDrop = function()
// {
//   while(!this.collision(0, 1, this.activeTetromino))
//   {
//
//     this.y++;
//
//   }
//   this.unDraw();
//   this.draw();
//   this.lock()
// }

// listens for keyboard input and based on the inputs code it does moves the piece
// accordingly
document.addEventListener("keydown", CONTROL);

function CONTROL(event)
{
    // to get the keycodes of keys go to, https://keycode.info
    // if the left button was pressed
    if(event.keyCode == 37)
    {
        piece.moveLeft();
    }
    // c
    else if(event.keyCode == 67)
    {
        // piece.rotate();
        piece.hold();
    }
    // x
    else if(event.keyCode == 88)
    {
        piece.counterRotate();
    }
    // right
    else if(event.keyCode == 39)
    {
        piece.moveRight();
    }
    // down
    else if(event.keyCode == 40)
    {
        piece.moveDown();
    }
    else if(event.keyCode == 38)
    {
        piece.hardDrop();
    }
}

// // this function helps us determine if the tetromino collides with the walls or
// // other pieces
// Piece.prototype.collision = function(offsetX, offsetY, pieceType)
// {
//   for(let i = 0; i < pieceType.length; ++i)
//   {
//
//     for(let j = 0; j < pieceType.length; ++j)
//     {
//
//       // if the piece is empty ( = 0) then we skip it cause it doesn't collide
//       if(!pieceType[i][j])
//       {
//         continue;
//       }
//
//       // where the piece is going to be moving to
//       let newX = this.x + j + offsetX;
//       let newY = this.y + i + offsetY;
//
//       // checks if it will collide with the wall
//       if(newX >= COLUMN || newX < 0 || newY >= ROW)
//       {
//         this.calcShiftAmount(newX, this.x, pieceType);
//         return true;
//       }
//
//       // don't want to index negatively into an array
//       // use case: when the piece first spawns it is outside of the canvas
//       if(newY < 0)
//       {
//         continue;
//       }
//
//       // checks if there new new spot is not empty
//       if( board[newY][newX] != EMPTY)
//       {
//         this.calcShiftAmount(newX, this.x, pieceType);
//         return true;
//       }
//     }
//   }
//   // there was no collision
//   return false;
// }

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
  if((currentTime - dropTime) > dropSpeed)
  {
    piece.moveDown();
    dropTime = Date.now();
  }
  // when the browser has time it will call this function again
  if( !gameOver)
  {
     requestAnimationFrame(drop);
 }
}

// locks the piece to the board, clears rows and calculates the score and speed of the game
Piece.prototype.lock = function()
{
  for(let i = 0; i < this.activeTetromino.length; ++i)
  {
     for(let j = 0; j < this.activeTetromino.length; ++j)
     {
         // ingore the empty/0 indexes
         if( !this.activeTetromino[i][j])
         {
             continue;
         }

         // game is over if the piece is locked over the board
         // might change this later so that you lose if the whole piece gets locked above the screen
         if(this.y + i < 0)
         {
             alert("Game Over");

             // stop request animation frame
             gameOver = true;
             break;
         }

         // we lock the piece
         board[this.y + i][this.x + j] = this.color;
     }
 }

 // removes full rows
 for(let i = 0; i < ROW; ++i)
 {
     let isRowFull = true;
     for(let j = 0; j < COLUMN; ++j)
     {
         isRowFull = isRowFull && (board[i][j] != EMPTY);

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
         for(let y = i; y > 1; y--)
         {
             for(let j = 0; j < COLUMN; ++j)
             {
                 board[y][j] = board[y - 1][j];
             }
         }

         // since we deleted a row there is no row above it
         // this might also change if the definition of game over changes
         for(let j = 0; j < COLUMN; ++j)
         {
             board[0][j] = EMPTY;
         }
         // increment the score
         score += 10;

         if(score % 50 == 0)
         {
           dropSpeed *= 0.80;
         }
         console.log(dropSpeed);
     }
 }

 // updates the board
 drawBoard();

 // console.log(board);
 // console.log(score);

 // updates the score
 scoreElement.innerHTML = score;

 // gets the next piece to be dropped
 this.getNextPiece();
}

Piece.prototype.getNextPiece = function()
{
  // remove the first element of the array and returns it to be stored in piece
  piece = listOfNextPieces.shift();

  // generates a random number 0 - 6
  randomNum = Math.floor(Math.random() * PIECES.length)
  // adds a piece to replace the one that was taken
  listOfNextPieces.push(new Piece(PIECES[randomNum][0], PIECES[randomNum][1]));
  // console.log(listOfNextPieces);
}

Piece.prototype.hold = function()
{
  if(!this.swapped)
  {
    this.swapped = true;
    holdPiece = this;
    this.getNextPiece();

    // before you progressing further rework the code with class Game
    // this class will have everything so you the Piece class will be
    // another class that will be another class for just piece stuff
    // this way we can keep track of everything easier
  }
}

function displaySettings()
{
  alert("Change Settings Button!");
}


// draws the board and the boarder around it
drawBoard();
drawBoarder();

// the current tetris piece in use
var piece = new Piece(PIECES[0][0], PIECES[0][1]);;
generateStartingPieces();
piece.getNextPiece();


drop();
