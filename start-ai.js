// canvasReady = false;
// window.onload = function(){canvasReady = true; Main();}

// this will be called from the start AI button from index.html
function Main()
{
  StartGame();
  // var best = new BestFirstSearch();
  // best.startAI();
  var steepest = new SteepestHillClimbing();
  steepest.startAI();
  console.log("END AI");
}

// path1 = "D";
// path2 = "L";
// path3 = "D";
//
// function Main()
// {
  // myVar = setTimeout(movePiece, 500, path1);
  // sleep(2000);
  // myVar2 = setTimeout(movePiece, 500, path2);
  // sleep(2000);
  // myVar2 = setTimeout(movePiece, 500, path3);
  // sleep(2000);
  // myVar2 = setTimeout(movePiece, 500, path2);
  // sleep(2000);
  // myVar2 = setTimeout(movePiece, 500, path2);
  // sleep(2000);
  // myVar2 = setTimeout(movePiece, 500, path2);
  // sleep(2000);
  // myVar2 = setTimeout(movePiece, 500, path3);
  // sleep(2000);
  // myVar2 = setTimeout(movePiece, 500, path3);

  // game.context.onload = movePiece(path3);
  // game.context.onload = sleep(2000);
  // game.context.onload = movePiece(path3);
  // game.context.onload = sleep(2000);
  // game.context.onload = movePiece(path3);
  // game.context.onload = sleep(2000);
  // game.context.onload = movePiece(path3);
  // game.context.onload = sleep(2000);
  // game.context.onload = movePiece(path3);
  // game.context.onload = sleep(2000);
  // game.context.onload = movePiece(path3);
  // game.context.onload = sleep(2000);
  // game.context.onload = movePiece(path3);

  // movePiece(path3);
  // sleep(2000);
  // movePiece(path3);
  // sleep(2000);
  // movePiece(path3);
  // sleep(2000);
  // movePiece(path3);
  // sleep(2000);
  // movePiece(path3);
  // sleep(2000);
  // movePiece(path3);
  // sleep(2000);
  // movePiece(path3);

// }

//
// function movePiece(path)
// {
//   // this will moves the pieces based on the path inputs that the heuristic generated
//   // console.log("======= entering function movePiece =======");
//   console.log(path);
//   if(path == "L")
//   {
//     // console.log("MOVING LEFT");
//     game.moveLeft();
//   }
//   else if (path == "R")
//   {
//     // console.log("MOVING RIGHT");
//     game.moveRight();
//   }
//   else if (path == "C")
//   {
//     // console.log("ROTATING");
//     game.rotate();
//   }
//   else if (path == "D")
//   {
//     // console.log("HARD DROP");
//     game.hardDrop();
//   }
//   else if (path == "H")
//   {
//     // console.log("HARD DROP");
//     game.hold();
//   }
//
// }
