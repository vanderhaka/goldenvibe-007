import { buildMazeLevel } from './mazeBuilder.js';
import { CURRENT_LEVEL_TYPE, LEVEL_TYPES, FLOOR_HEIGHT, WALL_HEIGHT } from './levelConfig.js';

// Level data tracking
let currentLevel = null;

/**
 * Builds the game level based on the configured level type
 * @returns {Object} - Information about the built level
 */
export function buildLevel() {
  console.log("Building level of type:", CURRENT_LEVEL_TYPE);
  
  let levelData = null;
  
  // Select the level builder based on type
  switch (CURRENT_LEVEL_TYPE) {
    case LEVEL_TYPES.MAZE:
      levelData = buildMazeLevel();
      break;
      
    // Additional level types can be added here
    case LEVEL_TYPES.ROOMS:
      //levelData = buildRoomsLevel();
      console.log("Room-based level type not implemented yet");
      levelData = buildMazeLevel(); // Fallback to maze
      break;
      
    case LEVEL_TYPES.COMPOUND:
      //levelData = buildCompoundLevel();
      console.log("Compound level type not implemented yet");
      levelData = buildMazeLevel(); // Fallback to maze
      break;
      
    default:
      console.error("Unknown level type:", CURRENT_LEVEL_TYPE);
      levelData = buildMazeLevel(); // Fallback to maze
  }
  
  // Store the current level data
  currentLevel = levelData;
  
  // Log the player start position
  const startPos = levelData.startPosition;
  console.log(
    "Player start position:", 
    startPos.x, 
    FLOOR_HEIGHT + WALL_HEIGHT / 2, 
    startPos.z
  );
  
  return levelData;
}

/**
 * Gets the player's starting position for the current level
 * @returns {Object} - The starting position {x, y, z}
 */
export function getPlayerStartPosition() {
  if (!currentLevel) {
    console.error("Trying to get player start position, but no level has been built yet");
    return { x: 0, y: FLOOR_HEIGHT + WALL_HEIGHT / 2, z: 0 };
  }
  
  return {
    x: currentLevel.startPosition.x,
    y: FLOOR_HEIGHT + WALL_HEIGHT / 2,
    z: currentLevel.startPosition.z
  };
}

/**
 * Gets the current level data
 * @returns {Object} - The current level data or null if no level built
 */
export function getCurrentLevel() {
  return currentLevel;
}
