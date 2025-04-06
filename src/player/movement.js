import * as THREE from 'three';
import { 
  controls, 
  velocity,
  direction,
  moveForward,
  moveBackward,
  moveLeft,
  moveRight,
  setVelocity
} from '../globals.js';
import { PLAYER_HEIGHT, PLAYER_SPEED, FRICTION } from './playerConfig.js';
import { handleCollisions } from './collision.js';

/**
 * Calculate the desired velocity based on input direction
 * @param {Object} currentVelocity - Current velocity vector
 * @param {Object} currentDirection - Current movement direction
 * @param {number} delta - Time delta for this frame
 * @returns {Object} - Updated velocity vector
 */
function calculateVelocity(currentVelocity, currentDirection, delta) {
  // Safeguard against null values
  if (!currentVelocity || !currentDirection || delta === undefined) {
    console.error("Invalid inputs to calculateVelocity", { currentVelocity, currentDirection, delta });
    return new THREE.Vector3();
  }
  
  // Apply friction to slow down movement
  currentVelocity.x -= currentVelocity.x * FRICTION * delta;
  currentVelocity.z -= currentVelocity.z * FRICTION * delta;
  
  // Safely read movement state with defaults
  const forward = moveForward === true;
  const backward = moveBackward === true;
  const left = moveLeft === true;
  const right = moveRight === true;

  // Set direction based on input
  currentDirection.z = Number(forward) - Number(backward);
  currentDirection.x = Number(right) - Number(left);
  currentDirection.normalize();
  
  // Apply movement force based on input
  if (forward || backward) {
    currentVelocity.z -= currentDirection.z * PLAYER_SPEED * delta;
  }
  
  if (left || right) {
    currentVelocity.x -= currentDirection.x * PLAYER_SPEED * delta;
  }
  
  return currentVelocity;
}

/**
 * Move the player based on current velocity and collisions
 * @param {Object} currentVelocity - Current velocity vector
 * @param {number} delta - Time delta for this frame
 */
function movePlayer(currentVelocity, delta) {
  // Guard against invalid controls
  if (!controls || !controls.moveRight || !controls.moveForward) {
    console.error("Controls not properly initialized for movement");
    return;
  }
  
  // Move right/left
  if (Math.abs(currentVelocity.x) > 0.001) {
    controls.moveRight(-currentVelocity.x * delta);
  }
  
  // Move forward/backward
  if (Math.abs(currentVelocity.z) > 0.001) {
    controls.moveForward(-currentVelocity.z * delta);
  }
  
  // Safely handle position updates
  try {
    // Maintain fixed height
    if (controls && controls.object && controls.object.position) {
      controls.object.position.y = PLAYER_HEIGHT;
    }
  } catch (error) {
    console.error("Error updating player position:", error);
  }
}

/**
 * Update player movement for the current frame
 * @param {number} delta - Time delta for this frame
 */
export function updateMovement(delta) {
  // Early return if controls aren't ready
  if (!controls) {
    console.warn("Controls not initialized, skipping movement update");
    return;
  }
  
  // Skip if pointer isn't locked
  if (!controls.isLocked) {
    // Reset velocity when not moving
    if (velocity) {
      velocity.x = 0;
      velocity.z = 0;
    }
    return;
  }
  
  try {
    // Clone velocity to avoid directly modifying the global value
    // Ensure we have a valid velocity object
    const currentVelocity = velocity ? velocity.clone() : new THREE.Vector3();
    const currentDirection = direction ? direction.clone() : new THREE.Vector3();
    
    // Calculate new velocity based on input
    const newVelocity = calculateVelocity(currentVelocity, currentDirection, delta);
    
    // Skip collision handling if controls object isn't ready
    if (!controls || !controls.object) {
      console.warn("Player object not ready, skipping collision check");
      return;
    }
    
    // Check for collisions and adjust velocity
    let adjustedVelocity = newVelocity;
    try {
      const playerPosition = controls.object.position;
      adjustedVelocity = handleCollisions(
        playerPosition, 
        newVelocity, 
        controls.object.quaternion, 
        delta
      );
    } catch (error) {
      console.error("Error in collision handling:", error);
    }
    
    // Move the player
    movePlayer(adjustedVelocity, delta);
    
    // Update global velocity
    if (setVelocity && adjustedVelocity) {
      setVelocity(adjustedVelocity);
    }
  } catch (error) {
    console.error("Error in movement system:", error);
  }
}
