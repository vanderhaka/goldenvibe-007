// This file is now a wrapper for the modular level system
import { 
  buildLevel as buildModularLevel,
  getPlayerStartPosition,
  getCurrentLevel 
} from './level/levelBuilder.js';

// Export the configuration constants for backward compatibility
import { 
  CELL_SIZE, 
  MAZE_WIDTH, 
  MAZE_HEIGHT, 
  WALL_REMOVAL_CHANCE,
  WALL_HEIGHT as wallHeight,
  FLOOR_THICKNESS as floorThickness,
  FLOOR_HEIGHT,
  ENEMY_Y_OFFSET,
  ENEMY_COUNT,
  AMMO_SPAWN_CHANCE
} from './level/levelConfig.js';

// Re-export the constants for backward compatibility
export {
  wallHeight,
  floorThickness,
  ENEMY_Y_OFFSET,
  FLOOR_HEIGHT,
  CELL_SIZE,
  MAZE_WIDTH,
  MAZE_HEIGHT,
  WALL_REMOVAL_CHANCE,
  ENEMY_COUNT,
  AMMO_SPAWN_CHANCE
};

// Re-export the main build function with the same name
export function buildLevel() {
  return buildModularLevel();
}

// Re-export the utility functions
export {
  getPlayerStartPosition,
  getCurrentLevel
};