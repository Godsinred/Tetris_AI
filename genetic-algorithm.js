var mutationRate = 0.05;
var mutationStep = 0.20;
var populationSize = 50;
var numberOfGenerations = 1;

// all the genomes
var genomes = [];
// this will be called from the start AI button from index.html
function Main()
{
  StartGame();
  GA();

  console.log("END AI");
}

function GA()
{

  // initializes the starting population
  initializePopulation();

  // go through all the generations
  for(var currentGeneration = 0; currentGeneration < numberOfGenerations; ++currentGeneration)
  {
    // we need to play the game with the genoes and store the score into the genome.fitness
    runGenomes();

    genomes.sort(function(a, b){return b.fitness - a.fitness});
    printMatrix(genomes);
    // evaluate and initalize the next generation
        // we need to select the fittest genomes

        // we need to crossover

        // we need to mutate them


  }
}

function initializePopulation()
{
  // creates the population size worth of genomes
  for(var i = 0; i < populationSize; ++i)
  {
    var genome = {
 			// the number of gaps a certain state has
 			numGaps: Math.random() - 0.5,
 			// the highest point of the board
 			maxHeight: Math.random() - 0.5,
 			// The standard deviation of the heights
 			std_height: Math.random() - 0.5,
 			// How much our score increases going to this state
 			scoreIncrease: Math.random() - 0.5,
      // how well we did using these set of values. initialize to 0
      fitness: 0
 		};
    genomes.push(genome);
  }
  console.log(genomes);
}


// runs all the genomes
function runGenomes()
{
  for(var i = 0; i < genomes.length; ++i)
  {
    console.log("Genome: " + i.toString());
    // the current tetris piece in use
    randomSeeded = new Random(1);
    game = new Game();
    game.drawBoard();
    game.drawBoarder();
    // creates the starting pieces for the game
    game.generateStartingPieces();
    // gets the first piece of the game
    game.getNextPiece();

    StartGame();
    var best = new BestFirstSearch(genomes[i].numGaps, genomes[i].maxHeight, genomes[i].std_height, genomes[i].scoreIncrease);
    genomes[i].fitness = best.startAI();
    console.log("Genome fitness: " + genomes[i].fitness);
  }

}
