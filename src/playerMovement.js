// This file is now a wrapper for the modular player movement system
import { updatePlayer, initializePlayer } from './player/playerManager.js';

// Re-export constants from the modular system for backward compatibility
import { 
  PLAYER_HEIGHT,
  PLAYER_SPEED,
  FRICTION,
  COLLISION_MARGIN
} from './player/playerConfig.js';

// Initialize the player systems
initializePlayer();

// Backward compatibility wrapper for updatePlayerMovement
export function updatePlayerMovement(delta) {
  updatePlayer(delta);
}

// Export constants for backward compatibility
export {
  PLAYER_HEIGHT,
  PLAYER_SPEED,
  FRICTION,
  COLLISION_MARGIN
};