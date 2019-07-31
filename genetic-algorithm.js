var mutationRate = 0.05;
var mutationStep = 0.20;
var populationSize = 50;
var currentGeneration = 0;
var numberOfGenerations = 50;

// the number of best genomes. will use this number to select top numElites parents
var numELites = 10;

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

  // var bestGenome = null;
  // go through all the generations
  for(currentGeneration = 0; currentGeneration < numberOfGenerations;)
  {
    // we need to play the game with the genoes and store the score into the genome.fitness
    runGenomes();

    genomes.sort(function(a, b){return b.fitness - a.fitness});
    // for logging the data if you want to do analysis on it later
    // printGenomes();

    // bestGenome = genomes[0];
    // console.log("Best fitness for gen " + currentGeneration.toString() + ": " + bestGenome.fitness.toString());
    // console.log("Genome weights for gen: ");
    // console.log(bestGenome);

    // evaluate and initalize the next generation
    makeNextGeneration();
  }
  // --currentGeneration;
  // console.log("Here is our best genome for the last generation " + numberOfGenerations.toString());
  // console.log("Best fitness for " + currentGeneration.toString() + ": " + bestGenome.fitness.toString());
  // console.log(bestGenome);
}

// initializes the starting genomes
function initializePopulation()
{
  // creates the population size worth of genomes
  for(var i = 0; i < populationSize; ++i)
  {
    var genome = {
      generation: currentGeneration,
 			// the number of gaps a certain state has
 			numGaps: Math.random() - 0.5,
 			// the highest point of the board
 			maxHeight: Math.random() - 0.5,
 			// The standard deviation of the heights
 			std_height: Math.random() - 0.5,
 			// How much our score increases going to this state
 			scoreIncrease: Math.random() - 0.5,
      // how well we did using these set of values. initialize to 0
      fitness: -1
 		};
    genomes.push(genome);
  }
  // console.log("init pop");
  // printMatrix(genomes);
}


// runs all the genomes
function runGenomes()
{
  for(var i = 0; i < genomes.length; ++i)
  {
    // we found a duplicate  entry and we updated the fitness for it and we can skip it and move on
    if(isDuplicateGenome(genomes[i], i))
    {
      continue;
    }

    // console.log("Genome: " + i.toString());
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
    // console.log("Genome fitness: " + genomes[i].fitness);
  }
}

function makeNextGeneration()
{
  ++currentGeneration;
  // we need to select the fittest genomes
  var elites = genomes.slice(0,numELites);

  // we need to crossover and mutate the parents to make children
  genomes = [];   // clears the current population
  for(var i = 0; i < populationSize; ++i)
  {
    genomes.push(makeChild(elites[Math.floor(Math.random() * numELites)], elites[Math.floor(Math.random() * numELites)]));
  }

  // console.log("Next Generation" + currentGeneration.toString());
  // printMatrix(genomes);
}

function makeChild(parent1, parent2)
{
  // Crossover is happening here between the 2 parents
  var genome = {
    generation: currentGeneration,
    // randomly assigns values from one of the parents
    numGaps: randomChoice(parent1.numGaps, parent2.numGaps),
    maxHeight: randomChoice(parent1.maxHeight, parent2.maxHeight),
    std_height: randomChoice(parent1.std_height, parent2.std_height),
    scoreIncrease: randomChoice(parent1.scoreIncrease, parent2.scoreIncrease),
    fitness: -1
  };

  // We mutate the child here. yes i know im horrible
  // Each value has a change of being mutated. if the random number is less than the mutation rate we change it
  if (Math.random() < mutationRate)
  {
 		genome.numGaps = genome.numGaps + Math.random() * mutationStep * 2 - mutationStep;
 	}
 	if (Math.random() < mutationRate)
  {
 		genome.maxHeight = genome.maxHeight + Math.random() * mutationStep * 2 - mutationStep;
 	}
 	if (Math.random() < mutationRate)
  {
 		genome.std_height = genome.std_height + Math.random() * mutationStep * 2 - mutationStep;
 	}
 	if (Math.random() < mutationRate)
  {
 		genome.scoreIncrease = genome.scoreIncrease + Math.random() * mutationStep * 2 - mutationStep;
 	}

  return genome;
}

// retuens a random choice between the 2
function randomChoice(x, y)
{
   if (Math.round(Math.random()) === 0)
   {
     return x;
   }
   else
   {
     return y;
   }
}

function isDuplicateGenome(curGenome, genomeNum)
{
  for(var i = 0; i < genomeNum; ++i)
  {
    // if it is the same we can assume it will have the same fitness level and update accordingly
    if(curGenome.numGaps === genomes[i].numGaps &&
      curGenome.maxHeight === genomes[i].maxHeight &&
      curGenome.std_height === genomes[i].std_height &&
      curGenome.scoreIncrease === genomes[i].scoreIncrease)
      {
        curGenome.fitness = genomes[i].fitness;
        return true;
      }
  }
  return false;
}

// printing this way so i can copy the console and export it to a csv format
function printGenomes()
{
  for(var i = 0; i < genomes.length; ++i)
  {
      console.log(genomes[i].generation.toString() + ',' + genomes[i].numGaps.toString() + ',' +
      genomes[i].maxHeight.toString() + ',' + genomes[i].std_height.toString() + ',' +
      genomes[i].scoreIncrease.toString() + ',' + genomes[i].fitness.toString());
  }
}
