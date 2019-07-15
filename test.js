// main

// the current tetris piece in use
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
