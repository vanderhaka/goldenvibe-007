// Level configuration settings

// Level dimensions
export const CELL_SIZE = 5; // Size of each maze cell
export const MAZE_WIDTH = 25; // Width of the maze in cells
export const MAZE_HEIGHT = 25; // Height of the maze in cells
export const WALL_REMOVAL_CHANCE = 0.15; // Chance to remove a wall after generation (creates loops)

// Vertical settings
export const WALL_HEIGHT = 3; // Height of walls
export const FLOOR_THICKNESS = 0.2; // Thickness of floor
export const FLOOR_HEIGHT = 0; // Base height of floor

// Gameplay elements
export const ENEMY_COUNT = 30; // Number of enemies to spawn in the maze
export const AMMO_SPAWN_CHANCE = 0.05; // Chance of spawning ammo in each cell
export const ENEMY_Y_OFFSET = 0.9; // Spawn point offset (centers enemy vertically)

// Level generation types
export const LEVEL_TYPES = {
    MAZE: 'maze',
    ROOMS: 'rooms',
    COMPOUND: 'compound'
};

// Current level type
export const CURRENT_LEVEL_TYPE = LEVEL_TYPES.COMPOUND;
