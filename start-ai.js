// canvasReady = false;
// window.onload = function(){canvasReady = true; Main();}

// this will be called from the start AI button from index.html
function playForMe()
{
  StartGame();
   // Run individual numbers to make sure that it is running properly
   // Think this one got 5000+ score
  var best = new BestFirstSearch(-0.6510316230834794,-0.3354738073259488,-0.40389225333322976,0.5754133093214668);
  best.startAI();
  // var steepest = new SteepestHillClimbing();
  // steepest.startAI();
  console.log("END AI");
}
