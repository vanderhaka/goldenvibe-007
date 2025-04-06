import * as THREE from 'three';

// Maze cell class
export class Cell {
    constructor(x, z) {
        this.x = x;
        this.z = z;
        this.visited = false;
        this.walls = {
            north: true,
            east: true,
            south: true, 
            west: true
        };
    }
    
    // Get world coordinates of the cell's center
    getWorldPosition(cellSize, mazeWidth, mazeHeight) {
        // Convert from grid coordinates to world coordinates
        // Offset by half the maze size to center the maze at the origin
        const worldX = (this.x - mazeWidth / 2) * cellSize;
        const worldZ = (this.z - mazeHeight / 2) * cellSize;
        return { x: worldX, z: worldZ };
    }
}

// Get unvisited neighbors of a cell
function getUnvisitedNeighbors(cell, grid, mazeWidth, mazeHeight) {
    const neighbors = [];
    const { x, z } = cell;
    
    // Check north
    if (z > 0 && !grid[x][z-1].visited) {
        neighbors.push(grid[x][z-1]);
    }
    
    // Check east
    if (x < mazeWidth - 1 && !grid[x+1][z].visited) {
        neighbors.push(grid[x+1][z]);
    }
    
    // Check south
    if (z < mazeHeight - 1 && !grid[x][z+1].visited) {
        neighbors.push(grid[x][z+1]);
    }
    
    // Check west
    if (x > 0 && !grid[x-1][z].visited) {
        neighbors.push(grid[x-1][z]);
    }
    
    return neighbors;
}

// Remove the wall between two cells
function removeWallBetween(current, next) {
    // Calculate the difference in coordinates
    const xDiff = next.x - current.x;
    const zDiff = next.z - current.z;
    
    if (xDiff === 1) {
        // Next is to the east
        current.walls.east = false;
        next.walls.west = false;
    } else if (xDiff === -1) {
        // Next is to the west
        current.walls.west = false;
        next.walls.east = false;
    } else if (zDiff === 1) {
        // Next is to the south
        current.walls.south = false;
        next.walls.north = false;
    } else if (zDiff === -1) {
        // Next is to the north
        current.walls.north = false;
        next.walls.south = false;
    }
}

// Generate a maze using the Depth-First Search algorithm
export function generateMaze(mazeWidth, mazeHeight, wallRemovalChance = 0.15) {
    // Create the 2D grid of cells
    const grid = Array(mazeWidth).fill().map((_, x) => 
        Array(mazeHeight).fill().map((_, z) => new Cell(x, z))
    );
    
    // Create a stack for the DFS algorithm
    const stack = [];
    
    // Start at a random cell
    const startX = Math.floor(Math.random() * mazeWidth);
    const startZ = Math.floor(Math.random() * mazeHeight);
    let current = grid[startX][startZ];
    current.visited = true;
    stack.push(current);
    
    // DFS to generate the maze
    while (stack.length > 0) {
        current = stack.pop();
        
        // Get unvisited neighbors
        const neighbors = getUnvisitedNeighbors(current, grid, mazeWidth, mazeHeight);
        
        if (neighbors.length > 0) {
            // Push current cell back to the stack
            stack.push(current);
            
            // Choose a random unvisited neighbor
            const nextIndex = Math.floor(Math.random() * neighbors.length);
            const next = neighbors[nextIndex];
            
            // Remove the wall between current and next
            removeWallBetween(current, next);
            
            // Mark the next cell as visited and push it to the stack
            next.visited = true;
            stack.push(next);
        }
    }
    
    // After generating the maze, randomly remove some walls to create loops
    for (let x = 0; x < mazeWidth; x++) {
        for (let z = 0; z < mazeHeight; z++) {
            const cell = grid[x][z];
            
            // Check each wall
            if (cell.walls.north && z > 0 && Math.random() < wallRemovalChance) {
                cell.walls.north = false;
                grid[x][z-1].walls.south = false;
            }
            
            if (cell.walls.east && x < mazeWidth - 1 && Math.random() < wallRemovalChance) {
                cell.walls.east = false;
                grid[x+1][z].walls.west = false;
            }
        }
    }
    
    return grid;
}
