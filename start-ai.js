// canvasReady = false;
// window.onload = function(){canvasReady = true; Main();}

// this will be called from the start AI button from index.html
function Main()
{
  StartGame();
  var best = new BestFirstSearch();
  best.startAI();
  // var steepest = new SteepestHillClimbing();
  // steepest.startAI();
  console.log("END AI");
}

// path1 = "D";
// path2 = "L";
// path3 = "D";
//
// function Main()
// {
//   var temp = [[1, 2, 3],
//               [4, 5, 6],
//               [7, 8, 9]];
//
//   edit1(temp);
//   printMatrix(temp);
// }
// function edit1(matrix)
// {
//   matrix[0][0] = 0;
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
