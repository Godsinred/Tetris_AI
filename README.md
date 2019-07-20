# Tetris AI

  The program allows the user to play the classic game of Tetris or if selected the AI can play a game for you.
  A steepest hill climbing algorithm is used to choose the next state of the Tetris game.
  
## Short Video Of The Program

N/A yet

## Getting Started

You will need any browser with JavaScript capabilities.

### Prerequisites

A web browser.

### Break down of the code

#### index.html

This file holds the canvas where the Tetris board is created and updated on.
It is also responsible for loading all the JavaScript(js) into the browser.

#### tetris.js

### Class Game
This holds the html canvas object for where we kept track of the pieces and other essential variable of the game.

##### Class Game - function drawBoarder()
This draws the outside of the Tetris board

##### Class Game - function drawSquare()
This function can be called to draw squares on the cnavas. It will be used many times to draw an undraw all the Tetris pieces.

##### Class Game - function fill()
Calls the draw square class for only the areas where the Tetris pieces reside in. Can choose the color for removing and adding pieces.

##### Class Game - function draw()
Draws in the Tetris piece be calling fill with the color of drawing.

##### Class Game - function unDraw()
Removes the Tetris piece from the board by calling fill with the color EMPTY.

##### Class Game - function collision()
Determines if there is collision between the piece and the board. It takes in the direction it is going and compares it to the matrix of the board. It also determines if a piece is near a wall and if so how much should it move to be able to rotate. Usually 1 but the long I in a certain roation needs 2 because of where the piece is in it rotation.

##### Class Game - function moveDown()
If the piece can move down 1 square it will move it down.

##### Class Game - function moveLeft()
If the piece can move left 1 square it will move it left.

##### Class Game - function rotate()
Rotates the piece clockwise if there is no collision.

##### Class Game - function counterRotate()
Rotates the piece counter clockwise if there is no collision.

##### Class Game - function moveRight()
If the piece can move right 1 square it will move it right.

##### Class Game - function hardDrop()
Drops the piece as far down as it can go and then locks it to the board.

##### Class Game - function ghostDrop()
Drops the shadow or ghost piece of the actual piece to the bottom of the board, so the user has an easy visualization of where the hard drop piece will end up.

##### Class Game - function lock()
Locks the current tetromino to the board and clears any rows if applicable. 
Sets up for the next piece as well.

##### Class Game - function getNextPiece()
Gets the next piece in the from the list and adds a piece to the list for its replacement.

##### Class Game - function getGhostColor()
Translates the current piece's color to the ghost's color.
We want this piece to naturally a little lighter so the user can determine the ghost piece from a piece that is locked to the board.

##### Class Game - function updateNextPiecesPNG()
Updates the pictures in the index.html page with the new current list of next pieces.

##### Class Game - function hold()
Holds the current piece and possibly switches it out with the current hold piece if applicable (The first held piece has nothing to switch with).

##### Class Game - function updatePNG()
Updates the param location with the color of the tetromino.

### document.addEventListener("keydown", CONTROL); - function CONTROL()
Listens for a keydown press and if there is it calls the CONTROL function.


### Class Piece

The exact tetromino that is the Piece. Has attributes of color, the rotations, which rotation number we are on, and which tetromino is currently active.

#### Class Piece - calcShiftAmount()
Determines how much the piece needs to shift to be able to rotate.

### function drop()
Starts the dropping of pieces sequence off. Will continuously keep dropping pieces until the game is over. The pieces drop faster as the game progresses.

### function displaySettings()
This will be where the user can change the keys of how the tetris pieces move.
--> Currently not implemented

### Class Random(seed)
Since there is no option to see the built in random class in js we used someone else's code of a random number generator.
https://gist.github.com/blixt/f17b47c62508be59987b
We want the code to be seeded so we test and debug our code we always get the same pieces.

#### Class Random(seed) - next()
Updates the seed value

### Class Random(seed) - nextFloat()
Call this function for a random float from 0-1 and not next.

### function StartGame()
This gets called when the button on the index.html get pressed so we can start the game for the user to play.









## Authors

* **Jonathan Ishii**     ------ [Godsinred](https://github.com/Godsinred)
