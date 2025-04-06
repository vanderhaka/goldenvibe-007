// Keep importing from Three.js for backward compatibility
import * as THREE from 'three';
import {
    scene,
    objects,
    enemies,
    camera,
    takePlayerDamage,
    audioListener
} from './globals.js';

// Import the modular components
import { 
    ENEMY_TYPES,
    ENEMY_SETTINGS 
} from './enemies/enemyTypes.js';

import {
    patrolDirections,
    getRandomPatrolPoint,
    moveEnemy,
    isPathClear,
    canSeePlayer
} from './enemies/enemyMovement.js';

import {
    createEnemyBulletImpact,
    enemyShoot,
    enemyMeleeAttack
} from './enemies/enemyCombat.js';

import {
    createEnemyObject as createModularEnemyObject
} from './enemies/enemyFactory.js';

import {
    initializeEnemySounds
} from './enemies/enemyAudio.js';

// Initialize sounds
initializeEnemySounds();

// Re-export constants for backward compatibility
const ENEMY_MELEE_RANGE = ENEMY_SETTINGS.MELEE_RANGE;
const ENEMY_SIGHT_RANGE = ENEMY_SETTINGS.SIGHT_RANGE;
const ENEMY_SHOOTING_RANGE = ENEMY_SETTINGS.SHOOTING_RANGE;
const ENEMY_SHOOTING_MIN_RANGE = ENEMY_SETTINGS.SHOOTING_MIN_RANGE;
const ENEMY_ATTACK_DAMAGE = ENEMY_SETTINGS.ATTACK_DAMAGE;
const ENEMY_SHOOTING_DAMAGE = ENEMY_SETTINGS.SHOOTING_DAMAGE;
const ENEMY_ATTACK_COOLDOWN = ENEMY_SETTINGS.ATTACK_COOLDOWN;
const ENEMY_SHOOTING_COOLDOWN = ENEMY_SETTINGS.SHOOTING_COOLDOWN;
const ENEMY_MOVEMENT_SPEED = ENEMY_SETTINGS.MOVEMENT_SPEED;
const ENEMY_PATROL_SPEED = ENEMY_SETTINGS.PATROL_SPEED;
const ENEMY_ACCURACY = ENEMY_SETTINGS.ACCURACY;
const ENEMY_PATROL_DISTANCE = ENEMY_SETTINGS.PATROL_DISTANCE;
const ENEMY_MAX_COUNT = ENEMY_SETTINGS.MAX_COUNT;

// Backward compatibility for raycaster
const patrolRaycaster = new THREE.Raycaster();

// Now just creates an enemy instance, using the modular factory
export function createEnemyObject(x, y, z) {
    return createModularEnemyObject(x, y, z);
}

// Spawn enemies at random positions throughout the maze
export function spawnEnemies(mazeGrid, cellSize, mazeWidth, mazeHeight, floorHeight, count = 10) {
    let enemiesSpawned = 0;
    
    // Keep trying until we spawn the requested number, or exceed the maximum attempts
    const maxAttempts = count * 3;
    let attempts = 0;
    
    while (enemiesSpawned < count && attempts < maxAttempts && enemies.length < ENEMY_MAX_COUNT) {
        attempts++;
        
        // Choose a random cell, avoiding the start area (avoid corners)
        const x = Math.floor(Math.random() * (mazeWidth - 4)) + 2;
        const z = Math.floor(Math.random() * (mazeHeight - 4)) + 2;
        
        // Get the world position of this cell
        const cell = mazeGrid[x][z];
        const pos = cell.getWorldPosition(cellSize, mazeWidth, mazeHeight);
        
        // Check if there's already an enemy nearby
        let tooClose = false;
        for (const enemy of enemies) {
            const distance = Math.sqrt(
                Math.pow(enemy.position.x - pos.x, 2) + 
                Math.pow(enemy.position.z - pos.z, 2)
            );
            if (distance < cellSize * 2) {
                tooClose = true;
                break;
            }
        }
        
        if (!tooClose) {
            // Spawn the enemy at this position
            const enemy = spawnEnemy(pos.x, floorHeight, pos.z);
            if (enemy) {
                enemiesSpawned++;
            }
        }
    }
    
    console.log(`Spawned ${enemiesSpawned} enemies`);
    return enemiesSpawned;
}

// Spawns an enemy and adds it to the scene/arrays
export function spawnEnemy(x, y, z) {
    if (enemies.length >= ENEMY_MAX_COUNT) {
        console.warn("Maximum enemy count reached");
        return null;
    }
    
    const enemy = createEnemyObject(x, y, z);
    scene.add(enemy);
    enemies.push(enemy);
    objects.push(enemy);
    
    return enemy;
}

// Deal damage to an enemy
export function damageEnemy(enemy, damage) {
    console.log(`🔴 DAMAGE: Starting damageEnemy function with damage=${damage}`);
    
    // Validate the enemy object
    if (!enemy) {
        console.error("🔴 DAMAGE ERROR: Invalid enemy object (null/undefined) passed to damageEnemy");
        return false;
    }
    
    if (!enemy.userData) {
        console.error("🔴 DAMAGE ERROR: Enemy missing userData:", enemy);
        return false;
    }
    
    if (typeof enemy.userData.health !== 'number') {
        console.error("🔴 DAMAGE ERROR: Enemy has invalid health value:", enemy.userData.health);
        // Initialize health as a fallback
        enemy.userData.health = 30;
    }
    
    // Debug info before applying damage
    console.log(`🔴 DAMAGE: Enemy before damage - ID: ${enemy.uuid.substring(0, 6)}, Health: ${enemy.userData.health}, Damage being applied: ${damage}`);
    
    // Apply damage
    enemy.userData.health -= damage;
    console.log(`🔴 DAMAGE: Enemy after damage - Health: ${enemy.userData.health} (${Math.round(enemy.userData.health / enemy.userData.maxHealth * 100)}% remaining)`);
    
    // Change color to indicate damage
    try {
        console.log("🔴 DAMAGE: Applying visual damage effect");
        enemy.traverse((child) => {
            if (child instanceof THREE.Mesh && 
                child.material instanceof THREE.MeshStandardMaterial) {
                child.material.emissive.set(0xff0000);
                child.material.emissiveIntensity = 0.5;
                
                // Reset after a short time
                setTimeout(() => {
                    if (child.material) {
                        child.material.emissiveIntensity = 0;
                    }
                }, 150);
            }
        });
    } catch (error) {
        console.error("🔴 DAMAGE ERROR: Error setting enemy damage visual:", error);
    }
    
    // Check if enemy is defeated
    if (enemy.userData.health <= 0) {
        // Enemy is defeated
        console.log(`🔴 DAMAGE: *** ENEMY KILLED *** Health=${enemy.userData.health} ≤ 0`);
        console.log(`🔴 DAMAGE: Enemy position: x=${enemy.position.x.toFixed(2)}, y=${enemy.position.y.toFixed(2)}, z=${enemy.position.z.toFixed(2)}`);
        
        // CRITICAL FIX: Immediately remove the enemy
        console.log("🔴 DAMAGE: IMMEDIATELY removing dead enemy");
        try {
            // Direct synchronous removal instead of setTimeout
            removeEnemy(enemy);
            return true;
        } catch (error) {
            console.error("🔴 DAMAGE ERROR: Error removing enemy:", error);
            // Fallback: Try a more aggressive removal approach
            try {
                console.error("🔴 DAMAGE: Attempting fallback removal");
                // Try to force-remove from scenes and arrays
                if (scene) scene.remove(enemy);
                
                // Try to remove from arrays directly
                const eIndex = enemies.indexOf(enemy);
                if (eIndex !== -1) enemies.splice(eIndex, 1);
                
                const oIndex = objects.indexOf(enemy);
                if (oIndex !== -1) objects.splice(oIndex, 1);
                
                console.log("🔴 DAMAGE: Fallback removal completed");
                return true;
            } catch (e) {
                console.error("🔴 DAMAGE ERROR: All removal attempts failed:", e);
                return false;
            }
        }
    } else {
        console.log(`🔴 DAMAGE: Enemy still alive with ${enemy.userData.health} health`);
    }
    
    return false;
}

// Remove an enemy from the game
export function removeEnemy(enemy) {
    console.log("🗑️ REMOVE: Starting removeEnemy function");
    
    if (!enemy) {
        console.error("🗑️ REMOVE ERROR: Tried to remove null/undefined enemy");
        return;
    }
    
    console.log(`🗑️ REMOVE: Removing enemy with ID ${enemy.uuid.substring(0, 6)}`);
    
    // First remove from scene to make the enemy visually disappear immediately
    try {
        console.log("🗑️ REMOVE: Removing enemy from THREE.js scene");
        scene.remove(enemy);
        console.log("🗑️ REMOVE: Enemy visually removed from scene");
    } catch (error) {
        console.error("🗑️ REMOVE ERROR: Error removing enemy from scene:", error);
    }
    
    // Then clean up the arrays
    try {
        console.log(`🗑️ REMOVE: Removing from enemies array (current length: ${enemies.length})`);
        const index = enemies.indexOf(enemy);
        if (index !== -1) {
            enemies.splice(index, 1);
            console.log(`🗑️ REMOVE: Removed enemy from enemies array, new length: ${enemies.length}`);
        } else {
            console.warn("🗑️ REMOVE WARNING: Could not find enemy in enemies array:", enemy);
        }
    } catch (error) {
        console.error("🗑️ REMOVE ERROR: Error removing from enemies array:", error);
    }
    
    try {
        console.log(`🗑️ REMOVE: Removing from objects array (current length: ${objects.length})`);
        const objIndex = objects.indexOf(enemy);
        if (objIndex !== -1) {
            objects.splice(objIndex, 1);
            console.log(`🗑️ REMOVE: Removed enemy from objects array, new length: ${objects.length}`);
        } else {
            console.warn("🗑️ REMOVE WARNING: Could not find enemy in objects array:", enemy);
        }
    } catch (error) {
        console.error("🗑️ REMOVE ERROR: Error removing from objects array:", error);
    }
    
    // Clean up geometries and materials to prevent memory leaks
    try {
        console.log("🗑️ REMOVE: Disposing enemy resources (geometries, materials)");
        enemy.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                if (child.geometry) {
                    child.geometry.dispose();
                }
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(material => material.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            }
        });
        console.log("🗑️ REMOVE: Enemy resources disposed successfully");
    } catch (error) {
        console.error("🗑️ REMOVE ERROR: Error disposing enemy resources:", error);
    }
    
    console.log("🗑️ REMOVE: Enemy removal complete");
}

// Update all enemies
export function updateEnemies(deltaTime) {
    // Get player position from camera
    const playerPosition = new THREE.Vector3();
    camera.getWorldPosition(playerPosition);
    
    // Update each enemy
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        
        // Skip invalid enemies
        if (!enemy || !enemy.userData) continue;
        
        // Skip dead enemies (health <= 0)
        if (enemy.userData.health <= 0) {
            // Dead enemy still in array - force remove it
            console.log(`Found dead enemy in update loop - health: ${enemy.userData.health}, removing it now`);
            removeEnemy(enemy);
            continue;
        }
        
        // Check if player is visible
        const canSee = canSeePlayer(enemy, playerPosition);
        const distanceToPlayer = enemy.position.distanceTo(playerPosition);
        
        // Current time
        const currentTime = Date.now();
        
        // Step 1: Update enemy state based on if they can see the player
        if (canSee) {
            enemy.userData.lastSeenPlayer = currentTime;
            enemy.userData.patrolling = false;
            
            // Look at player when they can see them
            enemy.lookAt(playerPosition.x, enemy.position.y, playerPosition.z);
            
            // Decide what to do based on distance to player
            if (distanceToPlayer < ENEMY_MELEE_RANGE) {
                // Player is in melee range - attack
                if (currentTime - enemy.userData.lastAttackTime > ENEMY_ATTACK_COOLDOWN * 1000) {
                    takePlayerDamage(enemy.userData.damage);
                    enemy.userData.lastAttackTime = currentTime;
                    console.log("Enemy melee attack!");
                }
            } else if (distanceToPlayer < ENEMY_SHOOTING_RANGE && distanceToPlayer > ENEMY_SHOOTING_MIN_RANGE) {
                // Player is in shooting range - shoot
                if (currentTime - enemy.userData.lastShootTime > enemy.userData.shootingCooldown * 1000) {
                    enemyShoot(enemy, playerPosition);
                    enemy.userData.lastShootTime = currentTime;
                }
            } else {
                // Player is too far - move toward player
                enemy.userData.moveTarget = playerPosition.clone();
                moveEnemy(enemy, enemy.userData.moveTarget, deltaTime, false);
            }
        } else {
            // Can't see player - patrol or return to patrol
            // If they recently saw the player (within 5 seconds), continue pursuing
            if (currentTime - enemy.userData.lastSeenPlayer < 5000) {
                // Continue in player's general direction
                if (enemy.userData.moveTarget) {
                    moveEnemy(enemy, enemy.userData.moveTarget, deltaTime, false);
                }
            } else {
                // Lost track of player, go back to patrolling
                enemy.userData.patrolling = true;
                
                // If we don't have a patrol target or we've reached it, get a new one
                if (!enemy.userData.moveTarget || 
                    enemy.position.distanceTo(enemy.userData.moveTarget) < 0.5) {
                    
                    // Get a new patrol direction
                    const possibleDirections = [];
                    
                    // Check each direction for obstacles
                    for (let i = 0; i < patrolDirections.length; i++) {
                        if (isPathClear(enemy.position, patrolDirections[i], 3)) {
                            possibleDirections.push(i);
                        }
                    }
                    
                    // Choose a random valid direction, or if none, use the current
                    if (possibleDirections.length > 0) {
                        enemy.userData.currentPatrolDirection = possibleDirections[
                            Math.floor(Math.random() * possibleDirections.length)
                        ];
                    }
                    
                    // Set new target based on direction
                    const direction = patrolDirections[enemy.userData.currentPatrolDirection].clone();
                    const distance = 2 + Math.random() * 3; // 2-5 units
                    
                    enemy.userData.moveTarget = new THREE.Vector3(
                        enemy.position.x + direction.x * distance,
                        enemy.position.y,
                        enemy.position.z + direction.z * distance
                    );
                }
                
                // Move toward patrol target
                moveEnemy(enemy, enemy.userData.moveTarget, deltaTime, true);
            }
        }
    }
}