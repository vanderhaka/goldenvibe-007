import { objects } from '../globals.js';
import { generateMaze } from '../mazeGenerator.js';
import { createMaterials } from '../materialManager.js';
import { buildCellWalls } from './wallBuilder.js';
import { buildMainFloor } from './floorBuilder.js';
import { placeItemsInMaze, placeStartingItems } from './itemPlacer.js';
import { 
  CELL_SIZE, 
  MAZE_WIDTH, 
  MAZE_HEIGHT, 
  WALL_REMOVAL_CHANCE 
} from './levelConfig.js';

/**
 * Builds a complete maze level
 * @returns {Object} - Information about the built level including start position
 */
export function buildMazeLevel() {
  // Clear any existing objects
  objects.length = 0;
  
  // Get materials
  const materials = createMaterials();
  const { wallMaterial, floorMaterial, wallTexture, floorTexture } = materials;
  
  // Generate the maze
  const maze = generateMaze(MAZE_WIDTH, MAZE_HEIGHT, WALL_REMOVAL_CHANCE);
  
  // Create the main floor
  const floorWidth = MAZE_WIDTH * CELL_SIZE;
  const floorHeight = MAZE_HEIGHT * CELL_SIZE;
  buildMainFloor(floorWidth, floorHeight, floorMaterial, floorTexture);
  
  // Build the maze walls
  const allWalls = [];
  for (let x = 0; x < MAZE_WIDTH; x++) {
    for (let z = 0; z < MAZE_HEIGHT; z++) {
      const cell = maze[x][z];
      const pos = cell.getWorldPosition(CELL_SIZE, MAZE_WIDTH, MAZE_HEIGHT);
      
      // Create walls for this cell
      const walls = buildCellWalls(cell, pos, CELL_SIZE, wallMaterial, wallTexture);
      allWalls.push(...walls);
    }
  }
  
  // Place the player near the start of the maze (top-left corner)
  const startCell = maze[1][1];
  const startPos = startCell.getWorldPosition(CELL_SIZE, MAZE_WIDTH, MAZE_HEIGHT);
  
  // Place starting items
  placeStartingItems(startPos);
  
  // Place random items and enemies throughout the maze
  const enemiesSpawned = placeItemsInMaze(maze, CELL_SIZE, MAZE_WIDTH, MAZE_HEIGHT);
  
  return {
    maze,
    startPosition: startPos,
    walls: allWalls,
    enemyCount: enemiesSpawned
  };
}
