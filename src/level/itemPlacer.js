import { createAmmoCrate } from '../interactionManager.js';
import { spawnEnemies } from '../enemyManager.js';
import { FLOOR_HEIGHT, AMMO_SPAWN_CHANCE, ENEMY_COUNT } from './levelConfig.js';

/**
 * Places items randomly throughout the maze
 * @param {Array} mazeGrid - The 2D maze grid
 * @param {number} cellSize - Size of each cell
 * @param {number} mazeWidth - Width of the maze in cells
 * @param {number} mazeHeight - Height of the maze in cells
 */
export function placeItemsInMaze(mazeGrid, cellSize, mazeWidth, mazeHeight) {
  // Place ammo crates
  for (let x = 0; x < mazeWidth; x++) {
    for (let z = 0; z < mazeHeight; z++) {
      const cell = mazeGrid[x][z];
      const pos = cell.getWorldPosition(cellSize, mazeWidth, mazeHeight);
      
      // Random chance to spawn an ammo crate
      if (Math.random() < AMMO_SPAWN_CHANCE) {
        createAmmoCrate(
          pos.x, 
          FLOOR_HEIGHT + 0.25, 
          pos.z
        );
      }
    }
  }
  
  // Spawn enemies throughout the maze
  const enemiesSpawned = spawnEnemies(
    mazeGrid, 
    cellSize, 
    mazeWidth, 
    mazeHeight, 
    FLOOR_HEIGHT, 
    ENEMY_COUNT
  );
  console.log(`Total enemies in the maze: ${enemiesSpawned}`);
  
  return enemiesSpawned;
}

/**
 * Places items at the player's starting position
 * @param {Object} startPos - The starting position coordinates
 */
export function placeStartingItems(startPos) {
  // Add a few guaranteed ammo crates near the start
  createAmmoCrate(startPos.x, FLOOR_HEIGHT + 0.25, startPos.z);
  createAmmoCrate(startPos.x + 1, FLOOR_HEIGHT + 0.25, startPos.z);
  createAmmoCrate(startPos.x, FLOOR_HEIGHT + 0.25, startPos.z + 1);
}
