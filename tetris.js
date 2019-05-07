// the canvas that is going to be drawn on the html canvas
const canvas = document.getElementById( "tetrisBoard" );
const context = canvas.getContext( "2d" );

// The size of the convas that the tetris game is going to be played on
const ROW = 20;
const COLUMN = 10;
const SQ = 50;

// The colors of the board and what they should be
const EMPTY = "WHITE";
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

// draws a boarder around the canvas
function drawBoarder()
{
  context.beginPath();
  context.lineWidth = 5;
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

  context.lineWidth = 2;
}

// draws a square
function drawSquare(x, y, color)
{
    context.fillStyle = color;
    context.fillRect(x*SQ,y*SQ,SQ,SQ);

    context.strokeStyle = "BLACK";
    context.strokeRect(x*SQ,y*SQ,SQ,SQ);
}

// draws the board
function drawBoard()
{

  for(i = 0; i < ROW; ++i){
      for(j = 0; j < COLUMN; ++j){
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
}

// fills the board based on the 2d array of the Piece
Piece.prototype.fill = function(color){
    for( i = 0; i < this.activeTetromino.length; ++i)
    {
        for(j = 0; j < this.activeTetromino.length; ++j)
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
function Piece.prototype.draw()
{
  this.fill(this.color);
}


// removes the piece from the canvas with it current cordinates
function Piece.prototype.unDraw()
{
  this.fill(EMPTY);
}

function Piece.prototype.moveDown()
{
  this.fill(this.color);
}

function Piece.prototype.moveLeft()
{
  this.fill(this.color);
}

function Piece.prototype.moveRight()
{
  this.fill(this.color);
}


function main()
{
  drawBoard();
  drawBoarder();
  var firstPiece = new Piece(PIECES[0][0], PIECES[0][1]);
  test.x = 5;

  test.y = 5;
  test.fill(test.color);

}
