// the canvas that is going to be drawn on the html canvas
const canvas = document.getElementById("tetrisBoard");
const context = canvas.getContext("2d");
var scoreElement = document.getElementById("score");
var score = 0;

// The size of the convas that the tetris game is going to be played on
const ROW = 20;
const COLUMN = 10;
const SQ = 50;

// The colors of the board and what they should be
const EMPTY = "WHITE";
// the board will also help us determine where pieces are already locked in place
// so we don't move into them or outside the board
var board = [];
for(i = 0; i < ROW; ++i)
{
    board[i] = [];
    for(j = 0; j < COLUMN; ++j)
    {
        board[i][j] = EMPTY;
    }
}

// all the different pieces and associates them to a color
const PIECES = [
    [Z,"RED"],
    [S,"GREEN"],
    [T, "PURPLE"],
    [O,"YELLOW"],
    [L,"BLUE"],
    [I,"CYAN"],
    [J,"ORANGE"]
];

// the time since the last drop
var dropTime = Date.now();
// for determining if the game is over or not
var gameOver = false;
// time since last move so if the user doesn't move the piece in X time it will lock in place
var lockTime = Date.now();

// the differenet drop speeds through out the game
const initialDropSpeed = 1000;
const dropSpeed2 = 750;
const dropSpeed3 = 500;
const dropSpeed4 = 250;
const dropSpeed5 = 150;
var dropSpeed = initialDropSpeed;

// draws a boarder around the canvas
function drawBoarder()
{
  context.beginPath();
  context.lineWidth = 2;
  context.strokeStyle = "black";

  // top boarder
  context.moveTo(0, 0);
  context.lineTo(500, 0);

  // right boarder
  context.moveTo(500, 0);
  context.lineTo(500, 1000);

  // bottom boarder
  context.moveTo(500, 1000);
  context.lineTo(0, 1000);

  // left boarder
  context.moveTo(0, 1000);
  context.lineTo(0, 0);
  context.stroke();


}

// draws a square
function drawSquare(x, y, color)
{
    context.lineWidth = 2;
    context.fillStyle = color;
    context.fillRect(x*SQ,y*SQ,SQ,SQ);

    context.strokeStyle = "BLACK";
    context.strokeRect(x*SQ,y*SQ,SQ,SQ);
}

// draws the board
function drawBoard()
{

  for(let i = 0; i < ROW; ++i){
      for(let j = 0; j < COLUMN; ++j){
          drawSquare(j,i,board[i][j]);
      }
  }
}

// input:
//  tetromino = the type of tetris piece that is going to be generated
//  color = the color of the piece
function Piece(tetromino, color)
{
    // the type of piece and it associated color
    this.tetromino = tetromino;
    this.color = color;

    // the default patter of every piece
    this.tetrominoN = 0;
    this.activeTetromino = this.tetromino[this.tetrominoN];

    // the starting place of the tetris pieces
    this.x = 3;
    this.y = -2;

    // list of the next pieces to come
    // the start always has one of each piece in a random order before giving out a completely random piece
    this.listOfNextPieces = [];
}

// generates one of each piece in a random order
Piece.prototype.generateStartingPieces = function()
{

}

// fills the board based on the 2d array of the Piece
Piece.prototype.fill = function(color)
{
    for(let i = 0; i < this.activeTetromino.length; ++i)
    {
        for(let j = 0; j < this.activeTetromino.length; ++j)
        {
            // we draw only occupied squares
            if(this.activeTetromino[i][j])
            {
                drawSquare(this.x + j,this.y + i, color);
            }
        }
    }
}

// draws the piece with its current values
Piece.prototype.draw = function()
{
  this.fill(this.color);
}


// removes the piece from the canvas with it current cordinates
Piece.prototype.unDraw = function()
{
  this.fill(EMPTY);
}

// moves the piece down if there is no collision
// locks the piece if the last unsuccessful move was longer than (0.5seconds)
Piece.prototype.moveDown = function()
{
  if(!this.collision(0, 1, this.activeTetromino))
  {
    this.unDraw();
    this.y++;
    this.draw();
    // resets the lock time
    lockTime = Date.now();
  }
  else
  {
    // this means it collided with something trying to move move down
    // if the lock time is longer than 0.5s then the piece gets locked
    if((Date.now() - lockTime) >= 500)
    {
      this.lock();
      // piece = getNextPiece();
    }
  }
}

// moves the piece left if there is no collision
Piece.prototype.moveLeft = function()
{
  if(!this.collision(-1, 0, this.activeTetromino))
  {
    this.unDraw();
    this.x--;
    this.draw();
    // resets the lock time
    lockTime = Date.now();
  }
}

// moves the piece right if there is no collision
Piece.prototype.moveRight = function()
{
  if(!this.collision(1, 0, this.activeTetromino))
  {
    this.unDraw();
    this.x++;
    this.draw();
    // resets the lock time
    lockTime = Date.now();
  }
}

// listens for keyboard input and based on the inputs code it does moves the piece
// accordingly
document.addEventListener("keydown", CONTROL);

function CONTROL(event)
{
    if(event.keyCode == 37)
    {
        piece.moveLeft();
    }
    else if(event.keyCode == 38)
    {
        // piece.rotate();
    }
    else if(event.keyCode == 39)
    {
        piece.moveRight();
    }
    else if(event.keyCode == 40)
    {
        piece.moveDown();
    }
}

// this function helps us determine if the tetromino collides with the walls or
// other pieces
Piece.prototype.collision = function(offsetX, offsetY, pieceType)
{
  for(let i = 0; i < pieceType.length; ++i)
  {
    for(let j = 0; j < pieceType.length; ++j)
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
      if( board[newY][newX] != EMPTY)
      {
        return true;
      }
    }
  }
  // there was no collision
  return false;
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
     }
 }

 // updates the board
 drawBoard();
 
 // console.log(board);
 // console.log(score);

 // updates the score
 scoreElement.innerHTML = score;
}

Piece.prototype.getNextPiece = function()
{

}

// draws the board and the boarder around it
drawBoard();
drawBoarder();

// the current tetris piece in use
var piece = new Piece(PIECES[0][0], PIECES[0][1]);

// testing code
piece.fill(piece.color);
drop();
