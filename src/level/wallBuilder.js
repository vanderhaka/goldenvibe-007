import { createWall } from '../geometryBuilder.js';
import { WALL_HEIGHT, FLOOR_HEIGHT } from './levelConfig.js';

/**
 * Builds walls for a maze cell
 * @param {Object} cell - The maze cell
 * @param {Object} position - World position of the cell
 * @param {number} cellSize - Size of each cell
 * @param {Object} wallMaterial - Material for walls
 * @param {Object} wallTexture - Texture for walls
 * @returns {Array} - Array of created walls
 */
export function buildCellWalls(cell, position, cellSize, wallMaterial, wallTexture) {
  const walls = [];
  const halfCell = cellSize / 2;
  
  // Build north wall
  if (cell.walls.north) {
    const wall = createWall(
      { x: position.x - halfCell, z: position.z - halfCell },
      { x: position.x + halfCell, z: position.z - halfCell },
      WALL_HEIGHT,
      wallMaterial,
      wallTexture,
      FLOOR_HEIGHT
    );
    
    if (wall) {
      wall.userData.type = 'wall';
      walls.push(wall);
    }
  }
  
  // Build east wall
  if (cell.walls.east) {
    const wall = createWall(
      { x: position.x + halfCell, z: position.z - halfCell },
      { x: position.x + halfCell, z: position.z + halfCell },
      WALL_HEIGHT,
      wallMaterial,
      wallTexture,
      FLOOR_HEIGHT
    );
    
    if (wall) {
      wall.userData.type = 'wall';
      walls.push(wall);
    }
  }
  
  // Build south wall
  if (cell.walls.south) {
    const wall = createWall(
      { x: position.x + halfCell, z: position.z + halfCell },
      { x: position.x - halfCell, z: position.z + halfCell },
      WALL_HEIGHT,
      wallMaterial,
      wallTexture,
      FLOOR_HEIGHT
    );
    
    if (wall) {
      wall.userData.type = 'wall';
      walls.push(wall);
    }
  }
  
  // Build west wall
  if (cell.walls.west) {
    const wall = createWall(
      { x: position.x - halfCell, z: position.z + halfCell },
      { x: position.x - halfCell, z: position.z - halfCell },
      WALL_HEIGHT,
      wallMaterial,
      wallTexture,
      FLOOR_HEIGHT
    );
    
    if (wall) {
      wall.userData.type = 'wall';
      walls.push(wall);
    }
  }
  
  return walls;
}
