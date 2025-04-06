import { getIsPlayerDead } from '../globals.js';
import { updateMovement } from './movement.js';

/**
 * Initialize player-related systems
 */
export function initializePlayer() {
  console.log("Initializing player systems");
  // Any initialization for player-related systems can go here
}

/**
 * Update all player-related systems for the current frame
 * @param {number} delta - Time delta for this frame
 */
export function updatePlayer(delta) {
  // Skip updates if player is dead
  if (getIsPlayerDead()) {
    return;
  }
  
  // Update movement
  updateMovement(delta);
  
  // Additional player updates could be added here:
  // - Health regeneration
  // - Weapon headbob
  // - Footstep sounds
  // - etc.
}
