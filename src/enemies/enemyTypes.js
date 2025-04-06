// Define different enemy types with their properties
export const ENEMY_TYPES = [
    { 
        color: 0xff0000, // Red - standard soldier
        health: 30, 
        damage: 1.0, // Damage multiplier
        speed: 1.0,  // Speed multiplier
        fireRate: 1.0 // Fire rate multiplier
    },
    { 
        color: 0x0000ff, // Blue - armored soldier
        health: 50, 
        damage: 0.8,
        speed: 0.8,
        fireRate: 1.2
    },
    { 
        color: 0xffff00, // Yellow - fast soldier
        health: 20, 
        damage: 1.2,
        speed: 1.5,
        fireRate: 1.3
    }
];

// Constants for enemy behavior
export const ENEMY_SETTINGS = {
    // Combat settings
    MELEE_RANGE: 2.0, 
    SIGHT_RANGE: 20.0,
    SHOOTING_RANGE: 15.0,
    SHOOTING_MIN_RANGE: 4.0,
    ATTACK_DAMAGE: 10,
    SHOOTING_DAMAGE: 8,
    ATTACK_COOLDOWN: 1.5,
    SHOOTING_COOLDOWN: 1.5,
    ACCURACY: 0.7,
    
    // Movement settings
    MOVEMENT_SPEED: 1.8,
    PATROL_SPEED: 1.2,
    PATROL_DISTANCE: 8.0,
    
    // System settings
    MAX_COUNT: 50
};
