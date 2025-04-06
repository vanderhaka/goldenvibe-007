import * as THREE from 'three';
import { objects } from '../globals.js';
import { COLLISION_MARGIN } from './playerConfig.js';

/**
 * Checks if the player can move in a specific direction
 * @param {Object} playerPosition - Current player position vector
 * @param {Object} movementVector - Movement direction vector
 * @param {Object} quaternion - Player's quaternion orientation
 * @returns {boolean} - True if movement is allowed, false if blocked
 */
export function checkCollision(playerPosition, movementVector, quaternion) {
  // Create a copy of the movement vector
  const direction = movementVector.clone();
  
  // Apply the player's rotation to the movement direction
  direction.applyQuaternion(quaternion);
  direction.normalize();
  
  // Create a raycaster in the direction of movement
  const raycaster = new THREE.Raycaster(playerPosition, direction);
  
  // Check for intersections with objects in the scene
  const intersections = raycaster.intersectObjects(objects, false);
  
  // If we hit something within our movement distance plus margin, block movement
  if (intersections.length > 0) {
    const distance = intersections[0].distance;
    const movementDistance = movementVector.length();
    
    return distance > movementDistance + COLLISION_MARGIN;
  }
  
  // No obstacles, movement is allowed
  return true;
}

/**
 * Perform directional collision checks and modify velocity accordingly
 * @param {Object} playerPosition - Current player position
 * @param {Object} velocity - Current velocity vector
 * @param {Object} quaternion - Player's quaternion orientation
 * @param {number} delta - Time delta for this frame
 * @returns {Object} - Modified velocity based on collisions
 */
export function handleCollisions(playerPosition, velocity, quaternion, delta) {
  // Check X movement
  if (Math.abs(velocity.x) > 0.001) {
    const movementX = new THREE.Vector3(velocity.x * delta, 0, 0);
    if (!checkCollision(playerPosition, movementX, quaternion)) {
      velocity.x = 0; // Stop X movement on collision
    }
  }
  
  // Check Z movement
  if (Math.abs(velocity.z) > 0.001) {
    const movementZ = new THREE.Vector3(0, 0, velocity.z * delta);
    if (!checkCollision(playerPosition, movementZ, quaternion)) {
      velocity.z = 0; // Stop Z movement on collision
    }
  }
  
  return velocity;
}
