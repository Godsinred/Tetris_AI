// canvasReady = false;
// window.onload = function(){canvasReady = true; Main();}

// this will be called from the start AI button from index.html
function Main()
{
  StartGame();
  var best = new BestFirstSearch();

  best.startAI();
  console.log("END AI");
}
