import { createFloorPanel } from '../geometryBuilder.js';
import { FLOOR_HEIGHT } from './levelConfig.js';

/**
 * Creates the main floor for a level
 * @param {number} width - Width of the level in world units
 * @param {number} height - Height of the level in world units
 * @param {Object} floorMaterial - Material for the floor
 * @param {Object} floorTexture - Texture for the floor
 * @returns {Object} - The created floor mesh
 */
export function buildMainFloor(width, height, floorMaterial, floorTexture) {
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  
  // Define the floor corners
  const floorPoints = [
    { x: -halfWidth, z: -halfHeight },
    { x: halfWidth, z: -halfHeight },
    { x: halfWidth, z: halfHeight },
    { x: -halfWidth, z: halfHeight }
  ];
  
  // Create and return the floor panel
  return createFloorPanel(
    floorPoints, 
    floorMaterial, 
    floorTexture, 
    FLOOR_HEIGHT
  );
}

/**
 * Creates a custom floor with the given points
 * @param {Array} points - Array of points defining the floor polygon
 * @param {Object} floorMaterial - Material for the floor
 * @param {Object} floorTexture - Texture for the floor
 * @returns {Object} - The created floor mesh
 */
export function buildCustomFloor(points, floorMaterial, floorTexture) {
  return createFloorPanel(
    points, 
    floorMaterial, 
    floorTexture, 
    FLOOR_HEIGHT
  );
}
